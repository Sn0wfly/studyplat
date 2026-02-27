# StudyPlat - Plataforma de Estudio con Preguntas

## Estructura del Proyecto

```
studyplat/
  frontend/                    # App React (la plataforma de estudio)
    src/
      questions.json           # BASE DE DATOS PRINCIPAL (la unica que importa)
      App.tsx
  parse_raw_questions.js       # Paso 1: Parsear texto crudo a JSON
  check_duplicates.js          # Paso 2: Detectar duplicados con IA
  crudo.txt                    # Input: preguntas en texto plano
  nuevas.json                  # Output del parser (input del checker)
  aprobadas.json               # Output: preguntas unicas listas para integrar
  rechazadas.json              # Output: duplicados rechazados con razon
  pendientes_revision.json     # Output: preguntas donde el LLM fallo (revision manual)
  package.json                 # Dependencias (axios, dotenv)
  .env                         # API key de SiliconFlow (NO commitear)
```

## Pipeline para agregar preguntas nuevas

### Paso 1: Preparar el texto crudo

Copiar preguntas de documentos/PDFs y pasarlas por una IA para que las formatee con este formato en `crudo.txt`:

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

Reglas: cada pregunta separada por una linea en blanco, enunciado arriba, opciones con `a)`, `b)`, etc.

### Paso 2: Parsear

```bash
node parse_raw_questions.js
```

- Lee `crudo.txt`, detecta el formato automaticamente
- Genera `nuevas.json` con estructura `{question, options, correct_answer, explanation, id}`
- Soporta formato limpio (lineas en blanco) y legacy (todo pegado en una linea)

### Paso 3: Detectar duplicados

```bash
node check_duplicates.js
```

Requiere `SILICONFLOW_API_KEY` en `.env`.

Compara cada pregunta nueva contra `frontend/src/questions.json` en 3 etapas:

| Etapa | Metodo | Costo |
|-------|--------|-------|
| Filtro 1 | Texto normalizado + overlap de palabras (>=90%) | Gratis |
| Filtro 2 | Embeddings semanticos (Qwen, similitud >=95%) | Barato |
| Filtro 3 | Juez LLM (DeepSeek, zona gris 82-95%) | Mas caro |

Genera:
- `aprobadas.json` - preguntas unicas
- `rechazadas.json` - duplicados con razon y ID del original
- `pendientes_revision.json` - preguntas donde el LLM fallo (si las hay)
- `embeddings_cache.json` - cache de embeddings (se regenera solo, pesa ~37MB)

Tambien detecta duplicados entre las nuevas mismas (no solo contra la DB).

### Paso 4: Integrar

Tomar las preguntas de `aprobadas.json` y agregarlas a `frontend/src/questions.json`.

## Archivos importantes - NO borrar

- `frontend/src/questions.json` - La DB principal, la app lee de aca
- `parse_raw_questions.js` - Parser de texto crudo
- `check_duplicates.js` - Detector de duplicados
- `package.json` - Dependencias
- `.env` - API key (no esta en git)

## Archivos temporales - Se pueden borrar

- `crudo.txt` - Se sobreescribe cada vez que pegas texto nuevo
- `nuevas.json` - Se regenera con `parse_raw_questions.js`
- `aprobadas.json` - Se regenera con `check_duplicates.js`
- `rechazadas.json` - Se regenera con `check_duplicates.js`
- `pendientes_revision.json` - Se regenera con `check_duplicates.js`
- `embeddings_cache.json` - Cache, se regenera solo

## Setup

```bash
npm install          # Instala axios y dotenv
echo "SILICONFLOW_API_KEY=tu_key" > .env
```
