from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import SettingSchema
from ..services import setting_service

bp = Blueprint("settings", __name__)
setting_schema = SettingSchema()


@bp.get("/<string:key>")
def get_setting(key: str):
    setting = setting_service.get_setting(key)
    if not setting:
        return jsonify({"key": key, "value": {}}), 200
    return jsonify(setting_schema.dump(setting))


@bp.put("/<string:key>")
@jwt_required()
def update_setting(key: str):
    payload = request.get_json() or {}
    value = payload.get("value")
    if value is None:
        return jsonify({"message": "Campo 'value' é obrigatório"}), 400
    setting = setting_service.upsert_setting(key, value)
    return jsonify(setting_schema.dump(setting))
