from typing import Dict, Optional

from ..extensions import db
from ..models import Opportunity
from ..utils.pagination import paginate


def list_opportunities(
    page: int = 1,
    per_page: int = 10,
    status: str | None = None,
    category: str | None = None,
) -> Dict:
    query = Opportunity.query
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Opportunity.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def get_opportunity(opportunity_id: int) -> Optional[Opportunity]:
    return Opportunity.query.get(opportunity_id)


def create_opportunity(payload: dict) -> Opportunity:
    opportunity = Opportunity(**payload)
    db.session.add(opportunity)
    db.session.commit()
    return opportunity


def update_opportunity(opportunity: Opportunity, payload: dict) -> Opportunity:
    for key, value in payload.items():
        setattr(opportunity, key, value)
    db.session.commit()
    return opportunity


def delete_opportunity(opportunity: Opportunity) -> None:
    db.session.delete(opportunity)
    db.session.commit()
