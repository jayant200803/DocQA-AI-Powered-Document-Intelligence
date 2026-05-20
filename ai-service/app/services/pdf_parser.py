import os
import pdfplumber
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pdfplumber (primary) with pypdf fallback."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    text = ""

    # Try pdfplumber first — better at tables and complex layouts
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception:
        text = ""

    # Fallback to pypdf if pdfplumber fails or returns empty
    if not text.strip():
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    if not text.strip():
        raise ValueError("PDF appears to be empty or contains only images (no extractable text).")

    return text.strip()


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from a plain text file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    if not text.strip():
        raise ValueError("Text file is empty.")

    return text.strip()


def extract_text(file_path: str) -> str:
    """Extract text from a file based on its extension."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".txt", ".text", ".md"):
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Only PDF and TXT files are supported.")
