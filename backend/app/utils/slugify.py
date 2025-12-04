import re
import unicodedata


def slugify(value: str) -> str:
    """Convert strings to URL-friendly slugs."""
    value = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    value = re.sub(r"-{2,}", "-", value)
    return value or "pagina"
