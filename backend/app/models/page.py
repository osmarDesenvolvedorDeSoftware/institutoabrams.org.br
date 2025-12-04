from datetime import datetime

from sqlalchemy.dialects.postgresql import JSONB

from ..extensions import db


class Page(db.Model):
    __tablename__ = "pages"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    title_translations = db.Column(JSONB, nullable=False, default=dict)
    content_translations = db.Column(JSONB, nullable=True, default=dict)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Page {self.slug}>"
