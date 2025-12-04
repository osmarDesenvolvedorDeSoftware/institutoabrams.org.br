from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import TranslationSchema
from ..services import translation_service

bp = Blueprint("translations", __name__)

translation_schema = TranslationSchema()


@bp.get("")
def list_translations():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    search = request.args.get("search")
    data = translation_service.list_translations(
        page=page, per_page=per_page, search=search
    )
    return jsonify(
        {
            "items": translation_schema.dump(data["items"], many=True),
            "meta": data["meta"],
        }
    )


@bp.post("")
@jwt_required()
def create_translation():
    payload = request.get_json() or {}
    errors = translation_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    translation = translation_service.create_translation(payload)
    return jsonify(translation_schema.dump(translation)), 201


@bp.get("/<int:translation_id>")
def get_translation(translation_id: int):
    translation = translation_service.get_translation(translation_id)
    if not translation:
        return jsonify({"message": "Translation not found"}), 404
    return jsonify(translation_schema.dump(translation))


@bp.put("/<int:translation_id>")
@jwt_required()
def update_translation(translation_id: int):
    translation = translation_service.get_translation(translation_id)
    if not translation:
        return jsonify({"message": "Translation not found"}), 404
    payload = request.get_json() or {}
    errors = translation_schema.validate(payload, partial=True)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    updated = translation_service.update_translation(translation, payload)
    return jsonify(translation_schema.dump(updated))


@bp.delete("/<int:translation_id>")
@jwt_required()
def delete_translation(translation_id: int):
    translation = translation_service.get_translation(translation_id)
    if not translation:
        return jsonify({"message": "Translation not found"}), 404
    translation_service.delete_translation(translation)
    return jsonify({"message": "Deleted"}), 204
