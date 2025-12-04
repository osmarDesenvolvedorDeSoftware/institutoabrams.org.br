from typing import Dict

from ..extensions import db
from ..models import Lead
from ..utils.pagination import paginate


def list_leads(page: int = 1, per_page: int = 10) -> Dict:
    query = Lead.query.order_by(Lead.created_at.desc())
    return paginate(query, page=page, per_page=per_page)


def create_lead(payload: dict) -> Lead:
    lead = Lead(**payload)
    db.session.add(lead)
    db.session.commit()
    return lead
