from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import BannerSchema
from ..services import banner_service

bp = Blueprint("banners", __name__)
public_bp = Blueprint("public_banners", __name__)
banner_schema = BannerSchema()


@bp.get("")
@jwt_required(optional=True)
def list_banners():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    is_active_param = request.args.get("is_active")
    is_active = None
    if is_active_param is not None:
        is_active = is_active_param.lower() in ["true", "1", "yes"]
    data = banner_service.list_banners(page=page, per_page=per_page, is_active=is_active)
    return jsonify(
        {
          "items": banner_schema.dump(data["items"], many=True),
          "meta": data["meta"],
        }
    )


@bp.post("")
@jwt_required()
def create_banner():
    payload = request.get_json() or {}
    errors = banner_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    banner = banner_service.create_banner(payload)
    return jsonify(banner_schema.dump(banner)), 201


@bp.put("/<int:banner_id>")
@jwt_required()
def update_banner(banner_id: int):
    banner = banner_service.get_banner(banner_id)
    if not banner:
        return jsonify({"message": "Banner not found"}), 404
    payload = request.get_json() or {}
    errors = banner_schema.validate(payload, partial=True)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    updated = banner_service.update_banner(banner, payload)
    return jsonify(banner_schema.dump(updated))


@bp.delete("/<int:banner_id>")
@jwt_required()
def delete_banner(banner_id: int):
    banner = banner_service.get_banner(banner_id)
    if not banner:
        return jsonify({"message": "Banner not found"}), 404
    banner_service.delete_banner(banner)
    return jsonify({"message": "Deleted"}), 204


@public_bp.get("/banners")
def public_banners():
    limit = request.args.get("limit", default=10, type=int)
    items = banner_service.list_public(limit=limit)
    return jsonify(banner_schema.dump(items, many=True))
