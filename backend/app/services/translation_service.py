from typing import Dict, Optional

from ..extensions import db
from ..models import Translation
from ..utils.pagination import paginate


def list_translations(page: int = 1, per_page: int = 20, search: str | None = None) -> Dict:
    query = Translation.query
    if search:
        query = query.filter(Translation.key.ilike(f"%{search}%"))
    query = query.order_by(Translation.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def get_translation(translation_id: int) -> Optional[Translation]:
    return Translation.query.get(translation_id)


def create_translation(payload: dict) -> Translation:
    translation = Translation(**payload)
    db.session.add(translation)
    db.session.commit()
    return translation


def update_translation(translation: Translation, payload: dict) -> Translation:
    for key, value in payload.items():
        setattr(translation, key, value)
    db.session.commit()
    return translation


def delete_translation(translation: Translation) -> None:
    db.session.delete(translation)
    db.session.commit()
