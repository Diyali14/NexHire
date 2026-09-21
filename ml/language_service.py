"""Language detection used to gate non-English resumes. Parsing is English-only."""

import re
import unicodedata

# Keywords strongly associated with non-English resumes.
_FOREIGN_MARKERS: dict[str, tuple[str, ...]] = {
    "fr": ("expérience", "compétences", "formation", "développeur", "projets", "entreprise"),
    "es": ("experiencia", "habilidades", "educación", "desarrollador", "empresa"),
    "de": ("erfahrung", "kenntnisse", "ausbildung", "entwickler", "unternehmen"),
    "pt": ("experiência", "educação", "desenvolvedor", "empresa", "habilidades"),
    "hi": ("अनुभव", "शिक्षा", "कौशल"),
    "zh": ("经验", "教育", "技能", "项目"),
    "ar": ("خبرة", "تعليم", "مهارات"),
}

# Keywords that strongly signal English content.
_ENGLISH_MARKERS = (
    "experience", "education", "skills", "work history", "employment",
    "university", "college", "degree", "bachelor", "master",
    "summary", "objective", "certification", "references",
)


def normalize_text(text: str) -> str:
    return unicodedata.normalize("NFKC", text).replace("\x00", "")


def detect_language(text: str) -> str:
    """Return a BCP-47 language tag for the dominant language of *text*.

    Returns ``"en"`` if the text looks English or is ambiguous.
    """
    sample = text[:8000]  # Only inspect the beginning for speed.
    folded = unicodedata.normalize("NFKD", sample.lower())
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))

    foreign_scores: dict[str, int] = {}
    for lang, markers in _FOREIGN_MARKERS.items():
        foreign_scores[lang] = sum(
            1 for m in markers if re.search(r"(?<!\w)" + re.escape(m) + r"(?!\w)", folded)
        )

    best_foreign_lang = max(foreign_scores, key=lambda k: foreign_scores[k])
    best_foreign_score = foreign_scores[best_foreign_lang]

    english_score = sum(
        1 for m in _ENGLISH_MARKERS
        if re.search(r"\b" + re.escape(m) + r"\b", folded)
    )

    # Require the foreign score to clearly exceed English to flag non-English.
    if best_foreign_score >= 2 and best_foreign_score > english_score:
        return best_foreign_lang

    return "en"


def is_english(text: str) -> bool:
    """Return ``True`` if *text* appears to be written in English."""
    return detect_language(text) == "en"
