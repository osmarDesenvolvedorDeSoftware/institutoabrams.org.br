from typing import Dict, Optional

from ..extensions import db
from ..models import Banner
from ..utils.pagination import paginate


def list_banners(page: int = 1, per_page: int = 20, is_active: bool | None = None) -> Dict:
    query = Banner.query
    if is_active is not None:
        query = query.filter_by(is_active=is_active)
    query = query.order_by(Banner.order.asc(), Banner.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def list_public(limit: int = 10) -> list[Banner]:
    return (
        Banner.query.filter_by(is_active=True)
        .order_by(Banner.order.asc(), Banner.created_at.desc())
        .limit(limit)
        .all()
    )


def get_banner(banner_id: int) -> Optional[Banner]:
    return Banner.query.get(banner_id)


def create_banner(payload: dict) -> Banner:
    banner = Banner(**payload)
    db.session.add(banner)
    db.session.commit()
    return banner


def update_banner(banner: Banner, payload: dict) -> Banner:
    for key, value in payload.items():
        setattr(banner, key, value)
    db.session.commit()
    return banner


def delete_banner(banner: Banner) -> None:
    db.session.delete(banner)
    db.session.commit()
