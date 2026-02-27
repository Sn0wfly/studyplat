import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generador de IDs únicos basado en timestamp + counter
let idCounter = 0;
function generateId() {
    return Date.now() * 1000 + (idCounter++);
}

// --- Parser para formato limpio (separado por --- o líneas en blanco) ---
function parsearFormatoLimpio(texto) {
    // Soporta separación por --- o por una o más líneas en blanco
    const bloques = texto.split(/(?:^---$|\n\s*\n)/m).map(b => b.trim()).filter(b => b.length > 0);
    const questions = [];

    for (const bloque of bloques) {
        const lineas = bloque.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lineas.length < 3) continue; // Necesita al menos enunciado + 2 opciones

        // Primera(s) línea(s) sin marcador de opción = enunciado
        // Líneas con marcador a), b), A., etc. = opciones
        const optionRegex = /^[a-eA-E][\.\)]\s+/;
        let enunciado = [];
        let opciones = [];

        for (const linea of lineas) {
            if (optionRegex.test(linea)) {
                opciones.push(linea.replace(optionRegex, '').trim());
            } else {
                // Si ya empezaron las opciones, esto es parte de la opción anterior (multilínea)
                if (opciones.length > 0) {
                    opciones[opciones.length - 1] += ' ' + linea;
                } else {
                    enunciado.push(linea);
                }
            }
        }

        const questionText = enunciado.join(' ')
            .replace(/^[0-9]+[\.\-\)]\s*/, '')
            .replace(/Seleccione una[:\.]?/gi, '')
            .trim();

        if (opciones.length >= 2) {
            questions.push({
                question: questionText,
                options: opciones,
                correct_answer: "",
                explanation: "",
                id: generateId()
            });
        }
    }

    return questions;
}

// --- Parser legacy para formato pegado sin separadores ---
function parsearPreguntasRegex(texto) {
    texto = texto.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    const regex = /(?:\s|^)([a-eA-E])([\.\)])\s/g;

    let parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(texto)) !== null) {
        const textBefore = texto.substring(lastIndex, match.index).trim();
        parts.push({
            text: textBefore,
            markerIndex: match.index,
            nextLetter: match[1].toLowerCase()
        });
        lastIndex = match.index + match[0].length;
    }

    const textAfter = texto.substring(lastIndex).trim();
    if (textAfter) {
        parts.push({
            text: textAfter,
            markerIndex: texto.length,
            nextLetter: null
        });
    }

    const questions = [];
    let currentQuestion = null;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part.nextLetter === 'a') {
            if (currentQuestion) {
                let splitPos = -1;

                splitPos = part.text.lastIndexOf('¿');

                if (splitPos === -1) {
                    const selMatch = part.text.match(/Seleccione una/i);
                    if (selMatch) {
                        splitPos = selMatch.index;
                        const dotMatch = part.text.substring(0, splitPos).lastIndexOf('.');
                        if (dotMatch !== -1 && splitPos - dotMatch < 150) {
                            splitPos = dotMatch + 1;
                        } else {
                            const upperMatch = part.text.substring(0, splitPos).match(/[A-Z]/);
                            if (upperMatch) splitPos = upperMatch.index;
                        }
                    }
                }

                if (splitPos === -1) {
                    const sentences = part.text.split(/(?<=[.?!])\s+(?=[A-Z¿])/);
                    if (sentences.length > 1) {
                        splitPos = part.text.indexOf(sentences[sentences.length - 1]);
                    }
                }

                if (splitPos > 0) {
                    const lastOptionContent = part.text.substring(0, splitPos).trim();
                    const newQuestionContent = part.text.substring(splitPos).trim();

                    currentQuestion.options.push(lastOptionContent);
                    questions.push(currentQuestion);

                    currentQuestion = {
                        question: newQuestionContent,
                        options: [],
                        correct_answer: "",
                        explanation: "",
                        id: generateId()
                    };
                } else {
                    questions.push(currentQuestion);
                    currentQuestion = {
                        question: part.text,
                        options: [],
                        correct_answer: "",
                        explanation: "",
                        id: generateId()
                    };
                }
            } else {
                currentQuestion = {
                    question: part.text,
                    options: [],
                    correct_answer: "",
                    explanation: "",
                    id: generateId()
                };
            }
        } else if (currentQuestion && part.nextLetter !== null) {
            currentQuestion.options.push(part.text);
        } else if (currentQuestion && part.nextLetter === null) {
            currentQuestion.options.push(part.text);
            questions.push(currentQuestion);
        }
    }

    questions.forEach(q => {
        q.question = q.question.replace(/^[0-9]+[\.\-\)]\s*/, '').trim();
        q.question = q.question.replace(/Seleccione una[:\.]?/gi, '').trim();
    });

    return questions;
}

function main() {
    console.log("🚀 Iniciando el parseador estructural local...");
    const crudoPath = path.join(__dirname, 'crudo.txt');
    const nuevasPath = path.join(__dirname, 'nuevas.json');

    if (!fs.existsSync(crudoPath)) {
        console.error(`❌ ERROR: No se encontró el archivo ${crudoPath}`);
        return;
    }

    const textoCrudo = fs.readFileSync(crudoPath, 'utf8');
    if (textoCrudo.trim().length === 0) {
        console.error("❌ ERROR: El archivo crudo.txt está vacío.");
        return;
    }

    // Detectar formato automáticamente
    // Formato limpio = tiene saltos de línea que separan bloques (cada bloque tiene enunciado + opciones)
    // Formato legacy = todo en una línea sin separadores claros
    const tieneMultiplesLineas = textoCrudo.trim().includes('\n');
    const tieneSeparadores = textoCrudo.includes('\n---\n') || textoCrudo.trim().startsWith('---');
    const usaFormatoLimpio = tieneSeparadores || tieneMultiplesLineas;
    let preguntasAisladas;

    if (usaFormatoLimpio) {
        console.log("📋 Formato detectado: LIMPIO (separado por líneas en blanco" + (tieneSeparadores ? " y ---" : "") + ")");
        preguntasAisladas = parsearFormatoLimpio(textoCrudo);
    } else {
        console.log("📋 Formato detectado: LEGACY (texto pegado en una línea)");
        console.log("⚠️  Tip: Para mejores resultados, separá las preguntas con líneas en blanco.");
        preguntasAisladas = parsearPreguntasRegex(textoCrudo);
    }

    // Validar calidad del parsing
    const sinEnunciado = preguntasAisladas.filter(q => !q.question.trim()).length;
    const pocasOpciones = preguntasAisladas.filter(q => q.options.length < 2).length;
    if (sinEnunciado > 0 || pocasOpciones > 0) {
        console.log(`\n⚠️  Problemas detectados:`);
        if (sinEnunciado > 0) console.log(`   - ${sinEnunciado} preguntas sin enunciado`);
        if (pocasOpciones > 0) console.log(`   - ${pocasOpciones} preguntas con menos de 2 opciones`);
    }

    fs.writeFileSync(nuevasPath, JSON.stringify(preguntasAisladas, null, 2), 'utf8');

    console.log(`\n✅ ¡Éxito! Se parsearon ${preguntasAisladas.length} preguntas.`);
    console.log(`📂 Guardadas en: ${nuevasPath}`);
    console.log(`➡️  Próximo paso: Ejecuta 'node check_duplicates.js'`);
}

main();
