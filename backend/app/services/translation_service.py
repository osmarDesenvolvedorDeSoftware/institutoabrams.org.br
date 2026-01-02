import json
import urllib.parse
import urllib.request


def translate_text(text: str, target: str, source: str = "auto") -> str | None:
    if not text or not target:
        return None
    try:
        query = urllib.parse.quote(text)
        url = (
            "https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl={source}&tl={target}&dt=t&q={query}"
        )
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = resp.read().decode("utf-8")
        parsed = json.loads(data)
        return parsed[0][0][0] if parsed and parsed[0] and parsed[0][0] else None
    except Exception:
        return None
