from typing import Dict, Optional

from ..extensions import db
from ..models import Page
from ..utils.pagination import paginate
from ..utils.slugify import slugify


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


def create_page(payload: dict) -> Page:
    if not payload.get("slug"):
        title_pt = payload.get("title_translations", {}).get("pt") or ""
        payload["slug"] = slugify(title_pt or "pagina")
    payload["slug"] = slugify(payload["slug"])
    page = Page(**payload)
    db.session.add(page)
    db.session.commit()
    return page


def update_page(page: Page, payload: dict) -> Page:
    payload.pop("slug", None)
    for key, value in payload.items():
        setattr(page, key, value)
    db.session.commit()
    return page


def delete_page(page: Page) -> None:
    db.session.delete(page)
    db.session.commit()
