from datetime import datetime

from ..extensions import db


class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    interest = db.Column(db.String(255), nullable=True)
    opportunity_id = db.Column(
        db.Integer, db.ForeignKey("opportunities.id"), nullable=True
    )
    message = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    opportunity = db.relationship("Opportunity", backref="leads")

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Lead {self.email}>"
