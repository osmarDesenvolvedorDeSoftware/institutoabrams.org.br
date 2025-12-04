from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import LeadSchema
from ..services import lead_service

bp = Blueprint("leads", __name__)

lead_schema = LeadSchema()


@bp.get("")
@jwt_required()
def list_leads():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    data = lead_service.list_leads(page=page, per_page=per_page)
    return jsonify({"items": lead_schema.dump(data["items"], many=True), "meta": data["meta"]})


@bp.post("")
def create_lead():
    payload = request.get_json() or {}
    errors = lead_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    lead = lead_service.create_lead(payload)
    return jsonify(lead_schema.dump(lead)), 201
