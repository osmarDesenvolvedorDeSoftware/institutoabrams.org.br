from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import OpportunitySchema
from ..services import opportunity_service

bp = Blueprint("opportunities", __name__)

opportunity_schema = OpportunitySchema()


@bp.get("")
def list_opportunities():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    status = request.args.get("status")
    category = request.args.get("category")
    data = opportunity_service.list_opportunities(
        page=page, per_page=per_page, status=status, category=category
    )
    return jsonify(
        {
            "items": opportunity_schema.dump(data["items"], many=True),
            "meta": data["meta"],
        }
    )


@bp.post("")
@jwt_required()
def create_opportunity():
    payload = request.get_json() or {}
    errors = opportunity_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    opportunity = opportunity_service.create_opportunity(payload)
    return jsonify(opportunity_schema.dump(opportunity)), 201


@bp.get("/<int:opportunity_id>")
def get_opportunity(opportunity_id: int):
    opportunity = opportunity_service.get_opportunity(opportunity_id)
    if not opportunity:
        return jsonify({"message": "Opportunity not found"}), 404
    return jsonify(opportunity_schema.dump(opportunity))


@bp.put("/<int:opportunity_id>")
@jwt_required()
def update_opportunity(opportunity_id: int):
    opportunity = opportunity_service.get_opportunity(opportunity_id)
    if not opportunity:
        return jsonify({"message": "Opportunity not found"}), 404
    payload = request.get_json() or {}
    errors = opportunity_schema.validate(payload, partial=True)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    updated = opportunity_service.update_opportunity(opportunity, payload)
    return jsonify(opportunity_schema.dump(updated))


@bp.delete("/<int:opportunity_id>")
@jwt_required()
def delete_opportunity(opportunity_id: int):
    opportunity = opportunity_service.get_opportunity(opportunity_id)
    if not opportunity:
        return jsonify({"message": "Opportunity not found"}), 404
    opportunity_service.delete_opportunity(opportunity)
    return jsonify({"message": "Deleted"}), 204
