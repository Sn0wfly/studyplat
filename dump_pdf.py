import fitz  # PyMuPDF

def main():
    pdf_path = "TODAS LAS preguntas para final.pdf"
    try:
        doc = fitz.open(pdf_path)
        with open("dump.txt", "w", encoding="utf-8") as f:
            f.write("--- PAGE 1 ---\n")
            f.write(doc[0].get_text())
            if len(doc) > 1:
                f.write("\n--- PAGE 2 ---\n")
                f.write(doc[1].get_text())
        
        doc.close()
        print("Dumped to dump.txt")
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    main()
