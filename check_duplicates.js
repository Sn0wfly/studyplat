import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;

if (!SILICONFLOW_API_KEY) {
    console.error('Error: SILICONFLOW_API_KEY is not set in .env file.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const EMBEDDING_MODEL = 'Qwen/Qwen3-Embedding-8B';
const LLM_MODEL = 'deepseek-ai/DeepSeek-V3';
const SIMILARITY_THRESHOLD_EXACT = 0.95; // Same exact question or very slight typo
const SIMILARITY_THRESHOLD_LLM = 0.82; // Borderline, needs LLM judgement
const API_BASE = 'https://api.siliconflow.com/v1';

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// --- Utility Functions ---

// normalize text for algorithmic comparison
function normalizeText(text) {
    return text.toLowerCase().replace(/[^\w\sáéíóúüñ]/g, '').replace(/\s+/g, ' ').trim();
}

// Get full text of a question (question + all options) for more robust comparison
function getFullText(q) {
    const opts = (q.options || []).map(o => o.replace(/^[A-Ea-e][\.\)]\s*/, '').trim());
    return q.question + ' ' + opts.join(' ');
}

// compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract keywords to avoid opposite questions (e.g. incorrecta vs correcta) matching
function hasConflictingKeywords(textA, textB) {
    const a = textA.toLowerCase();
    const b = textB.toLowerCase();

    // Pares de conceptos opuestos en español médico
    const conflictPairs = [
        [/\b(verdadera|correcta|cierta|válida)\b/, /\b(falsa|incorrecta|excepto|inválida)\b/],
        [/\b(mejor|ventaja|beneficio|indicación|indicado)\b/, /\b(peor|desventaja|riesgo|contraindicación|contraindicado)\b/],
        [/\b(se asocia|se relaciona|es causa)\b/, /\b(no se asocia|no se relaciona|no es causa)\b/],
        [/\b(primera línea|de elección)\b/, /\b(última línea|no se recomienda)\b/],
    ];

    for (const [pos, neg] of conflictPairs) {
        if (pos.test(a) && neg.test(b)) return true;
        if (neg.test(a) && pos.test(b)) return true;
    }

    return false;
}


// --- Retry Helper ---

async function withRetry(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`   ⏳ Reintentando en ${delay / 1000}s... (intento ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// --- API Functions ---

async function getEmbeddings(texts) {
    return withRetry(async () => {
        try {
            const response = await apiClient.post('/embeddings', {
                model: EMBEDDING_MODEL,
                input: texts,
                encoding_format: "float"
            });
            return response.data.data.map(item => item.embedding);
        } catch (error) {
            console.error("Error fetching embeddings:", error.response ? error.response.data : error.message);
            throw error;
        }
    });
}

async function askLLMJudge(qNew, qExisting) {
    const newOpts = (qNew.options || []).map((o, i) => `  ${String.fromCharCode(65 + i)}) ${o}`).join('\n');
    const existOpts = (qExisting.options || []).map((o, i) => `  ${String.fromCharCode(65 + i)}) ${o}`).join('\n');

    const prompt = `Estás actuando como un juez experto en evaluación médica.
Tengo dos preguntas de opción múltiple. Tu tarea es determinar si la Pregunta NUEVA es un duplicado o evalúa EXACTAMENTE el mismo concepto específico clínico/farmacológico que la Pregunta EXISTENTE.
Compara TANTO el enunciado COMO las opciones. Ignora pequeñas diferencias de redacción o si las opciones están en distinto orden. Si en esencia preguntan por lo mismo y tienen opciones similares, es un duplicado.
¡OJO! Si una pregunta pregunta "cuál es la CORRECTA" y la otra "cuál es la INCORRECTA", NO son duplicados porque evalúan cosas opuestas.

Pregunta NUEVA: "${qNew.question}"
Opciones:
${newOpts}

Pregunta EXISTENTE: "${qExisting.question}"
Opciones:
${existOpts}

Responde SOLO con un JSON estricto en el siguiente formato:
{"is_duplicate": true, "reason": "explicación muy breve de por qué"}
o
{"is_duplicate": false, "reason": "explicación muy breve de por qué"}`;

    try {
        const result = await withRetry(async () => {
            const response = await apiClient.post('/chat/completions', {
                model: LLM_MODEL,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                max_tokens: 150,
                temperature: 0.1
            });

            const content = response.data.choices[0].message.content;
            return JSON.parse(content);
        });

        // Validar que el resultado tenga la estructura esperada
        if (typeof result.is_duplicate !== 'boolean') {
            return { is_duplicate: null, reason: "Respuesta LLM inválida - requiere revisión manual" };
        }
        return result;
    } catch (error) {
        console.error("Error calling LLM Judge:", error.response ? error.response.data : error.message);
        // Devolver null para marcar como pendiente de revisión manual
        return { is_duplicate: null, reason: "Error en LLM - requiere revisión manual" };
    }
}


// --- Main Logic ---

async function main() {
    console.log("🚀 Iniciando detector de duplicados híbrido (Algoritmo + Embeddings + LLM)...");

    const existingFilePath = path.join(__dirname, 'frontend', 'src', 'questions.json');
    const newFilePath = path.join(__dirname, 'nuevas.json');

    if (!fs.existsSync(newFilePath)) {
        console.error(`❌ No se encontró el archivo ${newFilePath}. Crea un array JSON con las nuevas preguntas ahí.`);
        process.exit(1);
    }

    const existingDB = JSON.parse(fs.readFileSync(existingFilePath, 'utf8'));
    const newQuestions = JSON.parse(fs.readFileSync(newFilePath, 'utf8'));

    console.log(`📚 Base de datos actual: ${existingDB.length} preguntas.`);
    console.log(`📥 Preguntas nuevas a procesar: ${newQuestions.length}\n`);

    // 1. Generate embeddings for existing DB (con cache en disco)
    console.log("🧠 1/3 Cargando embeddings para la base de datos existente...");

    const existingTexts = existingDB.map(q => getFullText(q));
    const cachePath = path.join(__dirname, 'embeddings_cache.json');
    const dbHash = crypto.createHash('md5').update(JSON.stringify(existingTexts)).digest('hex');

    let existingEmbeddings = [];
    let cacheHit = false;

    // Intentar cargar cache
    if (fs.existsSync(cachePath)) {
        try {
            const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            if (cache.hash === dbHash && cache.embeddings.length === existingTexts.length) {
                existingEmbeddings = cache.embeddings;
                cacheHit = true;
                console.log(`   📦 Cache válido encontrado (${existingEmbeddings.length} embeddings). Saltando recálculo.`);
            }
        } catch (e) {
            console.log("   ⚠️ Cache corrupto, recalculando...");
        }
    }

    if (!cacheHit) {
        console.log("   🔄 Calculando embeddings desde cero...");
        const chunkSize = 50;

        for (let i = 0; i < existingTexts.length; i += chunkSize) {
            const chunk = existingTexts.slice(i, i + chunkSize);
            const embs = await getEmbeddings(chunk);
            existingEmbeddings.push(...embs);
            process.stdout.write(`\r   Procesados ${Math.min(i + chunkSize, existingTexts.length)} / ${existingTexts.length}`);
        }
        console.log("");

        // Guardar cache
        fs.writeFileSync(cachePath, JSON.stringify({ hash: dbHash, embeddings: existingEmbeddings }), 'utf8');
        console.log("   💾 Cache de embeddings guardado en disco.");
    }
    console.log("✅ Embeddings base listos!\n");

    const approvedQuestions = [];
    const rejectedQuestions = [];
    const pendingReview = [];

    // 2. Process new questions one by one
    console.log("🔍 2/3 Evaluando nuevas preguntas...");

    for (let i = 0; i < newQuestions.length; i++) {
        const nq = newQuestions[i];
        console.log(`\n▶️  Evaluando Pregunta ${i + 1}: "${nq.question.substring(0, 50)}..."`);

        let isDuplicate = false;
        let rejectReason = "";
        let duplicateOf = null;

        // --- STAGE 1: Algorithmic Quick Check ---
        // Comparamos tanto el enunciado solo como el texto completo (enunciado + opciones)
        // para detectar duplicados incluso cuando el parser fusiona texto basura en el enunciado
        const normNew = normalizeText(nq.question);
        const normNewFull = normalizeText(getFullText(nq));
        let foundExact = false;

        for (let j = 0; j < existingDB.length; j++) {
            const eq = existingDB[j];
            const normExisting = normalizeText(eq.question);
            const normExistingFull = normalizeText(getFullText(eq));

            const matchByQuestion = normNew === normExisting;
            const matchByFullText = normNewFull === normExistingFull;
            // Partial match: check if options overlap significantly (word-based)
            const newWords = new Set(normNewFull.split(' ').filter(w => w.length > 3));
            const existWords = new Set(normExistingFull.split(' ').filter(w => w.length > 3));
            let shared = 0;
            for (const w of newWords) if (existWords.has(w)) shared++;
            const overlap = Math.min(newWords.size, existWords.size) > 0
                ? shared / Math.min(newWords.size, existWords.size) : 0;

            if ((matchByQuestion || matchByFullText || overlap >= 0.90) && !hasConflictingKeywords(nq.question, eq.question)) {
                isDuplicate = true;
                duplicateOf = eq.id;
                rejectReason = "Filtro 1 (Algoritmo): Texto exactamente idéntico";
                foundExact = true;
                break;
            }
        }

        if (foundExact) {
            console.log(`   🚫 Rechazada - ${rejectReason} (ID: ${duplicateOf})`);
            rejectedQuestions.push({ question: nq, reason: rejectReason, duplicateId: duplicateOf });
            continue;
        }

        // --- STAGE 2: Semantic (Embeddings) ---
        const nqFullText = getFullText(nq);
        const [nqEmb] = await getEmbeddings([nqFullText]);

        // Encontrar top-3 matches más similares
        const TOP_K = 3;
        const topMatches = [];

        for (let j = 0; j < existingEmbeddings.length; j++) {
            const sim = cosineSimilarity(nqEmb, existingEmbeddings[j]);
            if (topMatches.length < TOP_K || sim > topMatches[topMatches.length - 1].sim) {
                topMatches.push({ index: j, sim });
                topMatches.sort((a, b) => b.sim - a.sim);
                if (topMatches.length > TOP_K) topMatches.pop();
            }
        }

        const bestMatch = existingDB[topMatches[0].index];
        const highestSim = topMatches[0].sim;
        console.log(`   📊 Similitud semántica máxima: ${(highestSim * 100).toFixed(2)}% (con ID: ${bestMatch.id})`);

        // Evaluar cada candidato del top-K que supere el umbral
        for (const candidate of topMatches) {
            if (isDuplicate) break;

            const candidateQ = existingDB[candidate.index];

            if (candidate.sim >= SIMILARITY_THRESHOLD_EXACT) {
                if (!hasConflictingKeywords(nq.question, candidateQ.question)) {
                    isDuplicate = true;
                    duplicateOf = candidateQ.id;
                    rejectReason = `Filtro 2 (Embeddings): Similitud muy alta (${(candidate.sim * 100).toFixed(1)}%)`;
                } else {
                    console.log(`   ⚠️ Similitud alta con ID ${candidateQ.id}, pero detecté conflicto de palabras. Saltando.`);
                }
            } else if (candidate.sim >= SIMILARITY_THRESHOLD_LLM) {
                // --- STAGE 3: LLM Judge ---
                console.log(`   ⚖️ Similitud ${(candidate.sim * 100).toFixed(1)}% con ID ${candidateQ.id}. Consultando al Juez LLM...`);
                const llmResult = await askLLMJudge(nq, candidateQ);
                console.log(`   🤖 Respuesta Juez: ${llmResult.is_duplicate === true ? 'Es duplicado' : llmResult.is_duplicate === null ? 'ERROR - Pendiente revisión' : 'Es NUEVA'} - Razón: ${llmResult.reason}`);

                if (llmResult.is_duplicate === true) {
                    isDuplicate = true;
                    duplicateOf = candidateQ.id;
                    rejectReason = `Filtro 3 (Juez LLM): ${llmResult.reason}`;
                } else if (llmResult.is_duplicate === null) {
                    // Error en LLM - marcar para revisión manual
                    pendingReview.push({ question: nq, reason: llmResult.reason, candidateId: candidateQ.id, similarity: candidate.sim });
                    console.log(`   ⏸️ Marcada para revisión manual por error de LLM.`);
                }
            }
        }

        // Verificar si fue marcada para revisión manual (no aprobar ni rechazar)
        const isPending = pendingReview.some(p => p.question === nq);

        if (isDuplicate) {
            console.log(`   🚫 Rechazada - ${rejectReason} (ID original: ${duplicateOf})`);
            rejectedQuestions.push({ question: nq, reason: rejectReason, duplicateId: duplicateOf });
        } else if (isPending) {
            // Ya fue agregada a pendingReview, no hacer nada más
        } else {
            console.log(`   ✅ Aprobada - Pregunta genuinamente nueva.`);
            approvedQuestions.push(nq);
            // Optimization: add the approved question to the embedding pool so we check against it for subsequent new questions
            existingDB.push(nq);
            existingEmbeddings.push(nqEmb);
        }
    }

    // --- REPORT ---
    console.log("\n\n============================================");
    console.log("📈 REPORTE FINAL");
    console.log("============================================");
    console.log(`Totales procesadas    : ${newQuestions.length}`);
    console.log(`Nuevas aprobadas      : ${approvedQuestions.length}  ✅`);
    console.log(`Duplicados frenados   : ${rejectedQuestions.length}  🚫`);
    if (pendingReview.length > 0) {
        console.log(`Pendientes revisión   : ${pendingReview.length}  ⏸️`);
    }

    fs.writeFileSync(path.join(__dirname, 'aprobadas.json'), JSON.stringify(approvedQuestions, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'rechazadas.json'), JSON.stringify(rejectedQuestions, null, 2), 'utf8');

    console.log("\nLas preguntas válidas se guardaron en 'aprobadas.json'.");
    console.log("El detalle de los rechazos se guardó en 'rechazadas.json'.");

    if (pendingReview.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'pendientes_revision.json'), JSON.stringify(pendingReview, null, 2), 'utf8');
        console.log(`⚠️ ${pendingReview.length} preguntas requieren revisión manual. Ver 'pendientes_revision.json'.`);
    }
}

main().catch(console.error);
