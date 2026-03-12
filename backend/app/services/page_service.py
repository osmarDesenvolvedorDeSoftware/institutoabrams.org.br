from typing import Dict, Optional

from ..extensions import db
from ..models import Page
from ..utils.html import normalize_rich_text_html
from ..utils.pagination import paginate
from ..utils.slugify import slugify
from . import translation_service


def list_pages(page: int = 1, per_page: int = 10, category: str | None = None) -> Dict:
    query = Page.query
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Page.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def get_page(page_id: int) -> Optional[Page]:
    return Page.query.get(page_id)


def get_page_by_slug(slug: str) -> Optional[Page]:
    return Page.query.filter_by(slug=slug).first()


def create_page_in_session(payload: dict, commit: bool = True) -> Page:
    payload = normalize_page_payload(payload)
    payload = expand_translations(payload)
    if not payload.get("slug"):
        title_pt = payload.get("title_translations", {}).get("pt") or ""
        payload["slug"] = slugify(title_pt or "pagina")
    payload["slug"] = slugify(payload["slug"])
    page = Page(**payload)
    db.session.add(page)
    if commit:
        db.session.commit()
    return page


def update_page(page: Page, payload: dict) -> Page:
    payload = normalize_page_payload(payload)
    payload = expand_translations(payload)
    payload.pop("slug", None)
    for key, value in payload.items():
        setattr(page, key, value)
    db.session.commit()
    return page


def expand_translations(
    payload: dict,
    source_lang: str = "pt",
    targets: tuple[str, ...] = ("en", "es", "fr"),
) -> dict:
    if not payload:
        return payload

    for field in ("title_translations", "content_translations"):
        translations = payload.get(field)
        if not isinstance(translations, dict):
            continue
        source_text = translations.get(source_lang)
        if not isinstance(source_text, str) or not source_text.strip():
            continue
        for target in targets:
            if translations.get(target):
                continue
            translated = translation_service.translate_text(source_text, target, source=source_lang)
            if translated:
                translations[target] = translated
        payload[field] = translations
    return payload


def normalize_page_payload(payload: dict) -> dict:
    if not payload:
        return payload

    content_translations = payload.get("content_translations")
    if isinstance(content_translations, dict):
        payload["content_translations"] = {
            lang: normalize_rich_text_html(value) for lang, value in content_translations.items()
        }

    return payload


def delete_page(page: Page) -> None:
    db.session.delete(page)
    db.session.commit()
