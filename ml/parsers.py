import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

import pymupdf
try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None
from docx import Document


if pytesseract is not None:
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

def extract_elements_from_unstructured(file_path: str) -> list[dict]:
    api_key = os.getenv("UNSTRUCTURED_API_KEY")
    api_url = os.getenv(
        "UNSTRUCTURED_API_URL",
        "https://platform-api.transform.unstructured.io/api/v1"
    )

    if not api_key:
        raise ValueError(
            "UNSTRUCTURED_API_KEY is missing from the .env file."
        )

    content_type = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }.get(Path(file_path).suffix.lower(), "application/octet-stream")

    if "platform-api.transform.unstructured.io" in api_url:
        return _extract_elements_from_platform_job(
            file_path, api_url, api_key, content_type
        )

    with open(file_path, "rb") as file:
        response = requests.post(
            api_url,
            headers={
                "unstructured-api-key": api_key
            },
            files={
                "files": (
                    os.path.basename(file_path),
                    file,
                    content_type
                )
            },
            data={
                "strategy": "hi_res",
                "languages": "eng",
            },
            timeout=120
        )

    try:
        response.raise_for_status()
    except requests.HTTPError as error:
        detail = response.text[:500].replace("\n", " ").strip()
        raise RuntimeError(
            f"Unstructured API request failed ({response.status_code}): {detail}"
        ) from error

    try:
        elements = response.json()
    except ValueError as error:
        raise RuntimeError("Unstructured API returned invalid JSON.") from error

    if not isinstance(elements, list):
        raise RuntimeError("Unstructured API returned an unexpected response shape.")
    return elements


