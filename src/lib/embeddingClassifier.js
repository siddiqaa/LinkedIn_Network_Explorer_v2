import { pipeline, env } from '@xenova/transformers';
import { TITLE_MAP } from '../data/titleMap';
import { classifyByKeyword } from '../data/keywordMap';

env.allowLocalModels = false;

let extractorInstance = null;
const embeddingCache = new Map(); // titleLower -> Float32Array
let prototypeEmbeddings = null;   // Array of { seniority, group, vector: Float32Array }

/**
 * Dynamically generate sub-prototypes from TITLE_MAP in titleMap.js
 */
export function generateTitleMapPrototypes() {
  const mapByCanonical = {};

  Object.entries(TITLE_MAP).forEach(([raw, val]) => {
    const canonical = typeof val === 'string' ? val : (val?.canonicalTitle || val?.canonical || raw);
    const sen = typeof val === 'object' ? val?.seniority : null;
    if (!mapByCanonical[canonical]) {
      mapByCanonical[canonical] = { rawSet: new Set([canonical]), seniority: sen };
    } else if (sen && !mapByCanonical[canonical].seniority) {
      mapByCanonical[canonical].seniority = sen;
    }
    mapByCanonical[canonical].rawSet.add(raw);
  });

  const titleMapSubPrototypes = [];

  Object.entries(mapByCanonical).forEach(([canonical, { rawSet, seniority }]) => {
    if (seniority && seniority !== "Unknown / Other") {
      // Add canonical title as a clean prototype
      titleMapSubPrototypes.push({
        seniority,
        group: `Canonical: ${canonical}`,
        text: canonical,
      });

      // Add all raw title variants from titleMap.js as prototype vectors
      Array.from(rawSet).forEach(raw => {
        const cleanRaw = raw.trim();
        if (cleanRaw && cleanRaw.toLowerCase() !== canonical.toLowerCase()) {
          titleMapSubPrototypes.push({
            seniority,
            group: `Canonical: ${canonical}`,
            text: cleanRaw,
          });
        }
      });
    }
  });

  return titleMapSubPrototypes;
}

/**
 * Load feature extraction pipeline (all-MiniLM-L6-v2)
 */
export async function loadExtractorModel() {
  if (!extractorInstance) {
    console.log("[Embedding ML] Loading Xenova/all-MiniLM-L6-v2 feature extraction model...");
    extractorInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    console.log("[Embedding ML] Model loaded successfully.");
  }
  return extractorInstance;
}

/**
 * Helper to compute dot product of two normalized Float32Arrays
 */
function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Pre-calculate and cache embeddings for TITLE_MAP canonical prototypes from titleMap.js
 */
async function getPrototypeEmbeddings(extractor) {
  if (prototypeEmbeddings) return prototypeEmbeddings;

  console.log("[Embedding ML] Generating prototype embeddings from TITLE_MAP entries...");
  const tmPrototypes = generateTitleMapPrototypes();

  const texts = tmPrototypes.map(p => p.text);
  const output = await extractor(texts, { pooling: 'mean', normalize: true });

  prototypeEmbeddings = tmPrototypes.map((p, idx) => {
    const vec = new Float32Array(output[idx].data);
    return { seniority: p.seniority, group: p.group, vector: vec };
  });

  console.log(`[Embedding ML] Successfully computed ${prototypeEmbeddings.length} prototype vectors from TITLE_MAP canonical groups.`);

  return prototypeEmbeddings;
}

/**
 * Classify a batch of titles using Embedding Cosine Similarity
 */
export async function classifyTitlesBatchEmbeddings(titles, onBatchProgress, maxBatchSize = 10000, miniBatchSize = 32) {
  console.log(`[Embedding ML] Classifying batch of ${titles.length} titles (max ${maxBatchSize}, miniBatch ${miniBatchSize})`);

  const results = {};
  const allUnique = Array.from(new Set(titles.map(t => (t || "").trim()))).filter(Boolean);
  const batchToProcess = allUnique.slice(0, maxBatchSize);

  let processed = 0;
  const uncachedToProcess = [];

  // Step 1: Direct TITLE_MAP check & Memory cache check
  for (const title of batchToProcess) {
    const key = title.toLowerCase();

    // Check memory cache first
    if (embeddingCache.has(key)) {
      uncachedToProcess.push(title);
      continue;
    }

    // Check direct TITLE_MAP match (case-insensitive)
    let directVal = TITLE_MAP[title];
    if (!directVal) {
      for (const k in TITLE_MAP) {
        if (k.toLowerCase() === key) {
          directVal = TITLE_MAP[k];
          break;
        }
      }
    }

    if (directVal) {
      const sen = typeof directVal === 'object' ? directVal.seniority : null;
      const canonical = typeof directVal === 'object' ? (directVal.canonicalTitle || directVal.canonical) : directVal;
      if (sen && sen !== "Unknown / Other") {
        results[title] = {
          seniority: sen,
          group: `Direct Map (${canonical || title})`,
          confidence: 100,
          rawLabel: `${sen} → Direct Map: ${canonical || title}`,
          scores: { [sen]: 1.0 },
          similarity: 1.0,
          directMatch: true
        };
        processed++;
        continue;
      }
    }

    uncachedToProcess.push(title);
  }

  if (processed > 0 && onBatchProgress) {
    onBatchProgress(processed, batchToProcess.length);
  }

  // If all titles were matched directly in TITLE_MAP, return instantly!
  if (uncachedToProcess.length === 0) {
    return results;
  }

  // Step 2: Load model & prototypes only if there are novel titles needing neural network embeddings
  const extractor = await loadExtractorModel();
  const prototypes = await getPrototypeEmbeddings(extractor);

  // Step 3: Classify titles that already have vectors in embeddingCache
  const titlesToEmbed = [];
  for (const title of uncachedToProcess) {
    const key = title.toLowerCase();
    if (embeddingCache.has(key)) {
      const vec = embeddingCache.get(key);
      results[title] = matchVectorToSeniority(vec, prototypes, title);
      processed++;
    } else {
      titlesToEmbed.push(title);
    }
  }

  if (processed > 0 && onBatchProgress) {
    onBatchProgress(processed, batchToProcess.length);
  }

  // Step 4: Process remaining uncached titles in parallel mini-batches
  for (let i = 0; i < titlesToEmbed.length; i += miniBatchSize) {
    const chunk = titlesToEmbed.slice(i, i + miniBatchSize);
    const t0 = performance.now();

    try {
      const output = await extractor(chunk, { pooling: 'mean', normalize: true });
      const dt = Math.round(performance.now() - t0);
      console.log(`[Embedding ML] Embedded ${chunk.length} titles in ${dt}ms (${(dt / chunk.length).toFixed(1)}ms/title)`);

      chunk.forEach((title, idx) => {
        const key = title.toLowerCase();
        const vec = new Float32Array(output[idx].data);
        embeddingCache.set(key, vec);
        results[title] = matchVectorToSeniority(vec, prototypes, title);
      });
    } catch (err) {
      console.warn("[Embedding ML] Batch extraction failed, falling back to sequential:", err);
      for (const title of chunk) {
        try {
          const singleOut = await extractor([title], { pooling: 'mean', normalize: true });
          const key = title.toLowerCase();
          const vec = new Float32Array(singleOut[0].data);
          embeddingCache.set(key, vec);
          results[title] = matchVectorToSeniority(vec, prototypes, title);
        } catch (e) {
          console.error(`[Embedding ML] Error embedding "${title}":`, e);
        }
      }
    }

    processed += chunk.length;
    if (onBatchProgress) onBatchProgress(processed, batchToProcess.length);

    await new Promise(r => setTimeout(r, 0));
  }

  return results;
}

/**
 * Compare title vector against sub-prototype vectors and return top matching seniority + similarity score (max-pooled)
 */
function matchVectorToSeniority(titleVec, subPrototypes, rawTitle = "") {
  let bestSeniority = "Unknown / Other";
  let maxSim = -1;
  let bestGroup = "";
  const seniorityScores = {}; // seniority -> maxSim

  subPrototypes.forEach(proto => {
    const sim = dotProduct(titleVec, proto.vector);
    const sen = proto.seniority;

    if (!seniorityScores[sen] || sim > seniorityScores[sen]) {
      seniorityScores[sen] = sim;
    }

    if (sim > maxSim) {
      maxSim = sim;
      bestSeniority = sen;
      bestGroup = proto.group;
    }
  });

  // Convert similarity [-1, 1] to confidence percentage [0, 100]
  const confidence = Math.max(0, Math.min(100, Math.round(maxSim * 100)));

  // Fallback for confidence < 50% using keyword mapping
  let finalSeniority = bestSeniority;
  let keywordMatch = null;

  if (confidence < 50 && rawTitle) {
    const kwResult = classifyByKeyword(rawTitle);
    if (kwResult) {
      finalSeniority = kwResult.seniority;
      keywordMatch = kwResult.keyword;
      bestGroup = `Keyword Match: "${kwResult.keyword}"`;
    }
  }

  return {
    seniority: finalSeniority,
    group: bestGroup,
    confidence,
    rawLabel: keywordMatch
      ? `${finalSeniority} → Keyword: "${keywordMatch}" (Sim: ${maxSim.toFixed(2)})`
      : `${bestSeniority} → ${bestGroup} (Sim: ${maxSim.toFixed(2)})`,
    scores: seniorityScores,
    similarity: maxSim,
    keywordFallback: keywordMatch
  };
}
