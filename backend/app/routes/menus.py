from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..schemas import MenuSchema, PageSchema
from ..services import menu_service, page_service

bp = Blueprint("menus", __name__)

menu_schema = MenuSchema()
page_schema = PageSchema()


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
    # deprecated: fluxo antigo de criacao manual. Use ContentWizard (pages/with-menu) ou add-submenu.
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


@bp.post("/<int:menu_id>/add-submenu")
@jwt_required()
def add_submenu(menu_id: int):
    parent = menu_service.get_menu(menu_id)
    if not parent:
        return jsonify({"message": "Parent menu not found"}), 404

    payload = request.get_json() or {}
    use_existing_page_id = payload.get("use_existing_page_id")
    page_data = payload.get("page") or {}

    page = None
    if use_existing_page_id is not None:
        page = page_service.get_page(use_existing_page_id)
        if not page:
            return jsonify({"message": "Page not found"}), 404
    elif page_data:
        try:
            loaded_page = page_schema.load(page_data)
        except ValidationError as err:
            return jsonify({"message": "Invalid payload", "errors": err.messages}), 400
        try:
            page = page_service.create_page_in_session(loaded_page, commit=True)
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Slug conflict creating page"}), 409
    else:
        return jsonify({"message": "Invalid payload"}), 400

    menu_payload = {
        "label": (page.title_translations or {}).get("pt") or page.slug,
        "slug": page.slug,
        "target": f"/pages/{page.slug}",
        "parent_id": menu_id,
        "order": payload.get("order"),
    }

    try:
        menu = menu_service.create_menu_with_defaults(menu_payload)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Slug conflict creating menu"}), 409

    if not parent.is_dropdown:
        parent.is_dropdown = True
        db.session.commit()

    parent = menu_service.get_menu(menu_id)

    return (
        jsonify(
            {
                "parent": menu_schema.dump(parent),
                "page": page_schema.dump(page),
                "menu": menu_schema.dump(menu),
            }
        ),
        201,
    )


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
