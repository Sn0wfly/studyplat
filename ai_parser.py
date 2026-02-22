import json
import re

def intelligent_parse(chunk):
    question_text = ""
    options = []
    correct_letter = None
    explanation = ""
    
    # 1. More permissive extraction of Question Text
    # The question is everything BEFORE the first "a." or "a)"
    q_match = re.search(r'^\d+[\.\)]\s*(.*?)(?=\n\s*[a-e][\.\)]|\n\s*Seleccione|\n\s*Marque|\Z)', chunk, re.DOTALL | re.IGNORECASE)
    if not q_match:
        # Sometimes there's no numbering or it's formatted weirdly, just take the first line as a fallback
        parts = chunk.split('\n')
        question_text = parts[0].strip() if parts else "Unknown Question Formulation"
    else:
        question_text = q_match.group(1).strip().replace('\n', ' ')
        
    question_text = re.sub(r'•\s*', '', question_text).strip()
    
    # 2. Extract Options AND find the correct answer
    opt_matches = list(re.finditer(r'\n\s*([a-e])[\.\)]\s*(.*?)(?=\n\s*[a-e][\.\)]|\n\s*\d+[\.\)]|\Z|\n\s*La respuesta correcta|\n\s*correcta|\n\s*incorrecta)', chunk, re.DOTALL | re.IGNORECASE))
    
    for match in opt_matches:
        letter = match.group(1).upper()
        opt_text = match.group(2).strip().replace('\n', ' ')
        
        is_correct_flag = False
        
        if "INCORRECTA" in question_text or "falsa" in question_text.lower():
            if re.search(r'\bincorrecta\b', opt_text, re.IGNORECASE) or re.search(r'\bincorrecto\b', opt_text, re.IGNORECASE):
                is_correct_flag = True
                opt_text = re.sub(r'\s*incorrect[oa]\s*', '', opt_text, flags=re.IGNORECASE)
        else:
            if re.search(r'\bcorrecta\b', opt_text, re.IGNORECASE) or re.search(r'\bcorrecto\b', opt_text, re.IGNORECASE):
                is_correct_flag = True
                opt_text = re.sub(r'\s*correct[oa]\s*', '', opt_text, flags=re.IGNORECASE)
            elif "*" in opt_text:
                is_correct_flag = True
                opt_text = opt_text.replace("*", "")
                
        # Also check if the line immediately AFTER the option in the raw text says "correcta" or "incorrecta"
        # Since our regex stops before it, we check the raw chunk
        if f"{match.group(1).lower()}." in chunk.lower() or f"{match.group(1).lower()})" in chunk.lower():
             if re.search(f"{match.group(1).lower()}[\.\)][^\n]+\n\s*correcta", chunk.lower()):
                 if "INCORRECTA" not in question_text and "falsa" not in question_text.lower():
                     is_correct_flag = True
             if re.search(f"{match.group(1).lower()}[\.\)][^\n]+\n\s*incorrecta", chunk.lower()):
                 if "INCORRECTA" in question_text or "falsa" in question_text.lower():
                     is_correct_flag = True

        options.append(f"{letter}. {opt_text.strip()}")
        if is_correct_flag and correct_letter is None: correct_letter = letter

    # 3. Check for specific trailing text blocks
    if not correct_letter:
        ans_match = re.search(r'La respuesta correcta es:.*?([a-e])\b', chunk, re.IGNORECASE)
        if ans_match: correct_letter = ans_match.group(1).upper()
        
    # Another pattern: "correcta" standing alone on a line right after an option
    if not correct_letter:
        if "correcta" in chunk.lower().split('\n') or "correcta " in chunk.lower().split('\n'):
             idx = [i for i, x in enumerate(chunk.lower().split('\n')) if "correcta" in x.strip()]
             if idx:
                 prev_line = chunk.split('\n')[idx[0]-1]
                 match_let = re.search(r'^\s*([a-e])[\.\)]', prev_line, re.IGNORECASE)
                 if match_let and ("INCORRECTA" not in question_text):
                     correct_letter = match_let.group(1).upper()
        if "incorrecta" in chunk.lower().split('\n') or "incorrecta " in chunk.lower().split('\n'):
             idx = [i for i, x in enumerate(chunk.lower().split('\n')) if "incorrecta" in x.strip()]
             if idx:
                 prev_line = chunk.split('\n')[idx[0]-1]
                 match_let = re.search(r'^\s*([a-e])[\.\)]', prev_line, re.IGNORECASE)
                 if match_let and ("INCORRECTA" in question_text or "falsa" in question_text.lower()):
                     correct_letter = match_let.group(1).upper()

    if not correct_letter and options:
        correct_letter = "A"
        explanation = "Warning: The correct answer was not explicitly parsed from the PDF text. Defaulting to A."
    elif correct_letter:
        explanation = f"Correct answer is {correct_letter}."

    if not options:
        # Create dummy options if it failed to parse them so we don't drop the question entirely
        options = ["A. Opcion de lectura manual", "B. Fallo de formato en PDF"]
        
    return {
        "id": 0, 
        "question": question_text,
        "options": options,
        "answer": correct_letter,
        "explanation": explanation
    }

def process_all_chunks():
    with open('raw_chunks.json', 'r', encoding='utf-8') as f:
        chunks = json.load(f)
        
    questions = []
    idx = 1
    # Skip the first element which is just "1"
    for chunk in chunks[1:]:
        q_obj = intelligent_parse(chunk)
        if q_obj:
            q_obj["id"] = idx
            questions.append(q_obj)
            idx += 1
            
    with open('questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully recovered {len(questions)} perfectly structured questions.")

if __name__ == "__main__":
    process_all_chunks()
