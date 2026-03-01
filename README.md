# StudyPlat - Plataforma de Estudio Medico MCQ

Plataforma web de preguntas tipo MCQ (Multiple Choice Question) para estudio medico.
Combina un banco propio de preguntas de Terapeutica Clinica con ~17,600 preguntas AMBOSS traducidas al espanol, cubriendo 66 disciplinas medicas.

Deploy en Vercel. Mobile-first.

## Stack Tecnico

- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS 3
- **UI**: Tema dark glassmorphism, Framer Motion para animaciones, Lucide icons
- **Auth**: Login simple con usuarios hardcodeados (por ahora)
- **Data**: JSONs estaticos en `public/data/` con lazy loading via `fetch()`
- **Deploy**: Vercel (auto-deploy desde main)

## Estructura del Proyecto

```
studyplat/
  frontend/                          # App React principal
    src/
      App.tsx                        # Entry point, routing entre vistas
      LoginPage.tsx                  # Pantalla de login
      SubjectSelector.tsx            # Selector de materias (post-login)
      SubjectNavbar.tsx              # Navbar superior para cambiar materia
      AmbossQuiz.tsx                 # Quiz para preguntas AMBOSS (UI rica)
      ImageModal.tsx                 # Modal fullscreen para imagenes
      types.ts                       # Tipos TypeScript
      questions.json                 # Preguntas originales Terapeutica Clinica (645)
      index.css / App.css            # Estilos
    public/
      data/
        subjects.json                # Indice de 66 materias (id, nombre, archivo, count)
        amboss_*.json (69 archivos)  # Preguntas AMBOSS traducidas al espanol
      images/ (6,308 archivos)       # Imagenes de preguntas AMBOSS (.jpg)

  scripts/
    translate_questions.py           # Script de traduccion masiva (ver seccion abajo)
    test_ministral.py                # Test de calidad Ministral-14B vs Qwen3-235B

  output/
    amboss_*.json (69 archivos)      # Copias ORIGINALES en ingles (backup, no tocar)

  translation_progress/
    *.json (66 archivos)             # Progreso de traduccion por materia
    test_ministral/                  # Resultados del test de calidad

  parse_raw_questions.js             # Parser de texto crudo (pipeline Terapeutica)
  check_duplicates.js                # Detector de duplicados con IA
  package.json                       # Dependencias del pipeline (axios, dotenv)
```

## Datos AMBOSS

### Origen
~17,600 preguntas MCQ scrapeadas de AMBOSS, organizadas en 66 disciplinas medicas.
Cada pregunta tiene:

- `question_text` - Viñeta clinica + pregunta
- `answers[]` - 5-6 opciones, cada una con:
  - `content` - Texto de la opcion
  - `is_correct` - Boolean
  - `explanation_why` - Por que es correcta/incorrecta
  - `explanation_but` - Matiz adicional ("pero tambien considerar...")
  - `selection_rate` - % de usuarios que eligieron esta opcion
- `hint` - Pista tipo "attending tip"
- `learning_objective` - Objetivo de aprendizaje
- `difficulty` - 1 a 5 (hammers)
- `images[]` - Imagenes asociadas (pregunta y respuestas)
- `eid` - ID unico
- `case` - Caso clinico extendido (opcional)

### Materias (66 subjects)
Incluye: Cardiologia, Neurologia, Pediatria, Cirugia General, Dermatologia, Infectologia, Farmacologia, Anatomia, Fisiologia, Bioquimica, Patologia, y muchas mas. Ver `subjects.json` para la lista completa.

Algunas materias tienen sub-especialidades:
- Medicina Interna: Cardiologia, Endocrinologia, Gastroenterologia, Hematologia, Nefrologia, Neumonologia, Reumatologia
- Cirugia: Abdominal, Cardiotoracica, General, Mano, Neurocirugia, Trauma, Vascular

## Traduccion al Espanol

### Resumen
Las 17,606 preguntas fueron traducidas del ingles al espanol medico profesional usando modelos de IA via OpenRouter API. Proceso completado al 100%.

### Modelos utilizados (en orden)
1. **Qwen3-235B-A22B** (`qwen/qwen3-235b-a22b-2507`) - Primera pasada, alta calidad pero lento y caro
2. **Ministral-14B** (`mistralai/ministral-14b-2512`) - Bulk translation, 80-85% calidad de Qwen3 pero 18x mas rapido y mucho mas barato
3. **Gemini 3 Flash** (`google/gemini-3-flash-preview`) - Ultimas 22 preguntas que fallaban, rapido y barato

### Script: `scripts/translate_questions.py`
```bash
# Traducir una materia
python scripts/translate_questions.py aging

# Retomar desde donde quedo
python scripts/translate_questions.py aging --resume

# Preview sin llamar API
python scripts/translate_questions.py aging --preview 0

# Traducir TODAS las materias
python scripts/translate_questions.py all --resume

# Controlar paralelismo (default: 50, max recomendado: 50)
python scripts/translate_questions.py all --resume --workers 20
```

### Detalles tecnicos de la traduccion
- **API**: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- **Paralelismo**: ThreadPoolExecutor, 50 workers maximo (>50 causa race conditions en archivos de progreso)
- **Resume**: Sistema de progreso por materia en `translation_progress/`. Cada pregunta traducida se guarda por `eid`, permitiendo retomar sin perder trabajo
- **Sanitizacion JSON**: Los modelos a veces generan caracteres de control en el JSON. Se limpian con `strict=False` y regex antes de parsear
- **Rate limiting**: Manejo de HTTP 429 con backoff exponencial
- **Reintentos**: 3 intentos por pregunta con waits incrementales
- **Prompt**: System prompt con reglas estrictas de terminologia medica (ver script)

### Reglas de traduccion
- Terminologia medica estandar en espanol: "dyspnea" -> "disnea", "tachycardia" -> "taquicardia", etc.
- NO traducir: farmacos, bacterias, sindromes eponimos, abreviaciones (ECG, CT), genes
- Mantener unidades como estan (mg/dL, mmol/L)
- Adaptar formulas clinicas: "A 65-year-old man" -> "Un hombre de 65 años"

### Post-procesamiento
- Fix automatico de "anos" -> "años" (4,862 reemplazos), respetando "ano" (anus) anatomico que queda sin cambios

### Costo total
~$30-35 USD en creditos OpenRouter para las 17,606 preguntas.

### Backups
Los archivos originales en ingles estan en `output/amboss_*.json` (NO tocar).
Los archivos traducidos estan en `frontend/public/data/amboss_*.json`.

## Pipeline Terapeutica Clinica (preguntas originales)

El banco original de 645 preguntas de Terapeutica Clinica tiene su propio pipeline de ingestion:

### Paso 1: Preparar texto crudo
Copiar preguntas de documentos/PDFs y formatearlas en `crudo.txt`:
```
Enunciado de la pregunta:
a) Opcion A
b) Opcion B
c) Opcion C
d) Opcion D

Otro enunciado:
a) Opcion A
b) Opcion B
c) Opcion C
```

### Paso 2: Parsear
```bash
node parse_raw_questions.js
```
Lee `crudo.txt`, genera `nuevas.json`.

### Paso 3: Detectar duplicados
```bash
node check_duplicates.js
```
Requiere `SILICONFLOW_API_KEY` en `.env`. Compara contra `frontend/src/questions.json` en 3 etapas:

| Etapa | Metodo | Costo |
|-------|--------|-------|
| Filtro 1 | Texto normalizado + overlap de palabras (>=90%) | Gratis |
| Filtro 2 | Embeddings semanticos (Qwen, similitud >=95%) | Barato |
| Filtro 3 | Juez LLM (DeepSeek, zona gris 82-95%) | Mas caro |

Genera: `aprobadas.json`, `rechazadas.json`, `pendientes_revision.json`

### Paso 4: Integrar
Agregar preguntas de `aprobadas.json` a `frontend/src/questions.json`.

## Setup local

```bash
# Frontend
cd frontend
npm install
npm run dev          # Dev server en localhost:5173

# Pipeline Terapeutica (opcional)
cd ..
npm install          # axios, dotenv
echo "SILICONFLOW_API_KEY=tu_key" > .env

# Traduccion (opcional, ya esta todo traducido)
pip install requests
python scripts/translate_questions.py all --resume
```

## Build y Deploy

```bash
cd frontend
npm run build        # Genera dist/
```

Deploy automatico en Vercel desde branch main.
