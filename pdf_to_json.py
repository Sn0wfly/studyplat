import fitz  # PyMuPDF
import json
import re
import traceback

def is_option(line):
    return re.match(r'^[a-e]\.\s', line.strip())

def parse_pdf_to_json(pdf_path, output_json="questions.json"):
    questions = []
    
    try:
        doc = fitz.open(pdf_path)
        print(f"Opened PDF with {len(doc)} pages.")
        
        current_question = None
        current_option = None
        
        for page_num in range(len(doc)):
            text = doc[page_num].get_text()
            lines = text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check if it's a new question number: e.g. "1.", "333."
                if re.match(r'^\d+\.$', line):
                    # Save previous
                    if current_question:
                        # Clean up
                        current_question["question"] = current_question["question"].strip()
                        questions.append(current_question)
                    
                    current_question = {
                        "id": int(line[:-1]),
                        "question": "",
                        "options": [],
                        "answer": "A", # default
                        "explanation": ""
                    }
                    current_option = None
                    continue
                
                # If we have a current question, collect lines
                if current_question:
                    if is_option(line):
                        current_option = {
                            "text": line,
                            "is_correct": False
                        }
                        current_question["options"].append(current_option)
                    elif line.lower() == "correcta":
                        if current_option:
                            current_option["is_correct"] = True
                            # Map option index to A, B, C, D...
                            idx = len(current_question["options"]) - 1
                            current_question["answer"] = chr(65 + idx)
                    elif line.lower() == "incorrecta":
                        pass # Ignore, it's just marking an incorrect option
                    elif line.lower() == "seleccione una:":
                        pass # Ignore noise
                    elif re.match(r'^\d+$', line) and page_num > 0 and len(line) < 4:
                        pass # Page number probably
                    else:
                        # If we are parsing options and a line doesn't match an option format,
                        # it might be a continuation of the previous option OR question text.
                        if len(current_question["options"]) > 0 and current_option:
                            current_option["text"] += " " + line
                        else:
                            current_question["question"] += " " + line
                            
        # Save the last question
        if current_question:
            current_question["question"] = current_question["question"].strip()
            questions.append(current_question)
            
        # Post-process options array to just strings
        final_questions = []
        for q in questions:
            # Clean options
            opts_clean = [opt["text"].strip() for opt in q["options"]]
            if len(opts_clean) == 0:
                continue # Skip invalid questions without options
            
            # If no correct answer was found, default to 'A' and add explanation note
            has_correct = any(opt.get("is_correct") for opt in q["options"])
            if not has_correct:
                q["explanation"] = "Warning: The PDF did not specify the correct answer for this question."
            
            final_questions.append({
                "id": q["id"],
                "question": q["question"],
                "options": opts_clean,
                "answer": q["answer"],
                "explanation": q["explanation"]
            })

        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(final_questions, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully extracted {len(final_questions)} questions to {output_json}")
        
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    parse_pdf_to_json("TODAS LAS preguntas para final.pdf", "questions.json")
