import re


EMPTY_PARAGRAPH_RE = re.compile(r"<p>(?:\s|&nbsp;|&#160;|<br\s*/?>)*</p>", re.IGNORECASE)
MULTISPACE_RE = re.compile(r"(?:\s|&nbsp;|&#160;)+", re.IGNORECASE)
INTERTAG_SPACE_RE = re.compile(r">\s+<")


def normalize_rich_text_html(value: str | None) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return value

    normalized = EMPTY_PARAGRAPH_RE.sub("", value)
    normalized = MULTISPACE_RE.sub(" ", normalized)
    normalized = INTERTAG_SPACE_RE.sub("><", normalized)
    return normalized.strip()
