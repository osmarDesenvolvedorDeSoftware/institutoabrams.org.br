from datetime import datetime

from ..extensions import db


class Menu(db.Model):
    __tablename__ = "menus"

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    target = db.Column(db.String(255), nullable=False)
    is_dropdown = db.Column(db.Boolean, default=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("menus.id"), nullable=True)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    parent = db.relationship("Menu", remote_side=[id], backref="children")

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Menu {self.label}>"
