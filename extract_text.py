"""
Extract all text from Romeo and Juliet PDF to plain TXT.
"""
import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Install PyMuPDF: pip install pymupdf")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).resolve().parent
PDF_PATH = SCRIPT_DIR / "Romeo and Juliet - William Shakespeare.pdf"
OUTPUT_PATH = SCRIPT_DIR / "romeo_and_juliet.txt"


def extract_text() -> None:
    if not PDF_PATH.exists():
        print(f"PDF not found: {PDF_PATH}")
        sys.exit(1)

    doc = fitz.open(PDF_PATH)
    pages_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        pages_text.append(text)
    doc.close()

    full_text = "\n".join(pages_text)

    # Remove common page numbers (standalone numbers)
    full_text = re.sub(r"\n\s*(\d+)\s*\n", "\n", full_text)
    # Collapse excessive newlines
    full_text = re.sub(r"\n{3,}", "\n\n", full_text)
    full_text = full_text.strip()

    OUTPUT_PATH.write_text(full_text, encoding="utf-8")
    print(f"Extracted {len(full_text):,} characters to {OUTPUT_PATH}")


if __name__ == "__main__":
    extract_text()
