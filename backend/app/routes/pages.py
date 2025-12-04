from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..schemas import PageSchema
from ..services import page_service

bp = Blueprint("pages", __name__)

page_schema = PageSchema()


@bp.get("")
def list_pages():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    data = page_service.list_pages(page=page, per_page=per_page)
    return jsonify(
        {"items": page_schema.dump(data["items"], many=True), "meta": data["meta"]}
    )


@bp.post("")
@jwt_required()
def create_page():
    payload = request.get_json() or {}
    errors = page_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    try:
        page = page_service.create_page(payload)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Slug already exists"}), 409
    return jsonify(page_schema.dump(page)), 201


@bp.get("/<int:page_id>")
def get_page(page_id: int):
    page = page_service.get_page(page_id)
    if not page:
        return jsonify({"message": "Page not found"}), 404
    return jsonify(page_schema.dump(page))


@bp.put("/<int:page_id>")
@jwt_required()
def update_page(page_id: int):
    page = page_service.get_page(page_id)
    if not page:
        return jsonify({"message": "Page not found"}), 404
    payload = request.get_json() or {}
    errors = page_schema.validate(payload, partial=True)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    updated = page_service.update_page(page, payload)
    return jsonify(page_schema.dump(updated))


@bp.delete("/<int:page_id>")
@jwt_required()
def delete_page(page_id: int):
    page = page_service.get_page(page_id)
    if not page:
        return jsonify({"message": "Page not found"}), 404
    page_service.delete_page(page)
    return jsonify({"message": "Deleted"}), 204
