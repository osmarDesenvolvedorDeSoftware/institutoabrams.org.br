from datetime import datetime

from sqlalchemy.dialects.postgresql import JSONB

from ..extensions import db


class Translation(db.Model):
    __tablename__ = "translations"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), nullable=False, unique=True)
    texts = db.Column(JSONB, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Translation {self.key}>"
