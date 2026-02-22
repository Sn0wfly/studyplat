import fitz  # PyMuPDF

def main():
    pdf_path = "TODAS LAS preguntas para final.pdf"
    try:
        doc = fitz.open(pdf_path)
        with open("dump_end.txt", "w", encoding="utf-8") as f:
            total_pages = len(doc)
            f.write(f"--- PAGE {total_pages-1} ---\n")
            f.write(doc[total_pages-2].get_text())
            f.write(f"\n--- PAGE {total_pages} ---\n")
            f.write(doc[total_pages-1].get_text())
        
        doc.close()
        print("Dumped end to dump_end.txt")
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    main()
