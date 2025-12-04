from datetime import datetime

from ..extensions import db


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    institution = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default="draft")
    deadline = db.Column(db.Date, nullable=True)
    official_link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Opportunity {self.title}>"
