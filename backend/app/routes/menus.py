from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..schemas import MenuSchema
from ..services import menu_service

bp = Blueprint("menus", __name__)

menu_schema = MenuSchema()


@bp.get("")
def list_menus():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    parent_id = request.args.get("parent_id", type=int)
    data = menu_service.list_menus(page=page, per_page=per_page, parent_id=parent_id)
    return jsonify(
        {"items": menu_schema.dump(data["items"], many=True), "meta": data["meta"]}
    )


@bp.post("")
@jwt_required()
def create_menu():
    payload = request.get_json() or {}
    errors = menu_schema.validate(payload)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    menu = menu_service.create_menu(payload)
    return jsonify(menu_schema.dump(menu)), 201


@bp.get("/<int:menu_id>")
def get_menu(menu_id: int):
    menu = menu_service.get_menu(menu_id)
    if not menu:
        return jsonify({"message": "Menu not found"}), 404
    return jsonify(menu_schema.dump(menu))


@bp.put("/<int:menu_id>")
@jwt_required()
def update_menu(menu_id: int):
    menu = menu_service.get_menu(menu_id)
    if not menu:
        return jsonify({"message": "Menu not found"}), 404
    payload = request.get_json() or {}
    errors = menu_schema.validate(payload, partial=True)
    if errors:
        return jsonify({"message": "Invalid payload", "errors": errors}), 400
    updated = menu_service.update_menu(menu, payload)
    return jsonify(menu_schema.dump(updated))


@bp.delete("/<int:menu_id>")
@jwt_required()
def delete_menu(menu_id: int):
    menu = menu_service.get_menu(menu_id)
    if not menu:
        return jsonify({"message": "Menu not found"}), 404
    menu_service.delete_menu(menu)
    return jsonify({"message": "Deleted"}), 204


# Aliases for menu-items endpoints (same handlers)
@bp.get("/items")
def list_menu_items():
    return list_menus()


@bp.post("/items")
@jwt_required()
def create_menu_item():
    return create_menu()


@bp.get("/items/<int:menu_id>")
def get_menu_item(menu_id: int):
    return get_menu(menu_id)


@bp.put("/items/<int:menu_id>")
@jwt_required()
def update_menu_item(menu_id: int):
    return update_menu(menu_id)


@bp.delete("/items/<int:menu_id>")
@jwt_required()
def delete_menu_item(menu_id: int):
    return delete_menu(menu_id)
