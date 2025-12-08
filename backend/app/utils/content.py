import re
from html import unescape


def strip_tags(html: str) -> str:
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", html)
    text = unescape(text)
    return " ".join(text.split())
