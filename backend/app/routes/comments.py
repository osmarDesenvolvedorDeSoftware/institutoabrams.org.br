from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from ..extensions import db
from ..models import Comment, Page
from ..schemas import CommentCreateSchema, CommentSchema

bp = Blueprint("comments", __name__)

comment_schema = CommentSchema()
comment_create_schema = CommentCreateSchema()


@bp.get("/page/<string:slug>")
def list_comments(slug: str):
    page = Page.query.filter_by(slug=slug).first()
    if not page:
        return jsonify({"message": "Page not found"}), 404

    comments = (
        Comment.query.filter_by(page_id=page.id, is_approved=True)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return jsonify(comment_schema.dump(comments, many=True))


@bp.post("/page/<string:slug>")
def create_comment(slug: str):
    page = Page.query.filter_by(slug=slug).first()
    if not page:
        return jsonify({"message": "Page not found"}), 404

    payload = request.get_json() or {}
    try:
        data = comment_create_schema.load(payload)
    except ValidationError as err:
        return jsonify({"message": "Invalid payload", "errors": err.messages}), 400

    comment = Comment(
        page_id=page.id,
        name=data["name"].strip(),
        email=(data.get("email") or "").strip() or None,
        content=data["content"].strip(),
        is_approved=True,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment_schema.dump(comment)), 201
