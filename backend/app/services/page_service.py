from typing import Dict, Optional

from ..extensions import db
from ..models import Page
from ..utils.pagination import paginate


def list_pages(page: int = 1, per_page: int = 10) -> Dict:
    query = Page.query.order_by(Page.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def get_page(page_id: int) -> Optional[Page]:
    return Page.query.get(page_id)


def create_page(payload: dict) -> Page:
    page = Page(**payload)
    db.session.add(page)
    db.session.commit()
    return page


def update_page(page: Page, payload: dict) -> Page:
    for key, value in payload.items():
        setattr(page, key, value)
    db.session.commit()
    return page


def delete_page(page: Page) -> None:
    db.session.delete(page)
    db.session.commit()
