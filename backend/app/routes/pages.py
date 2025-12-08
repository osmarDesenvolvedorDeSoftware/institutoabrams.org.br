import json
import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Menu
from ..schemas import MenuSchema, PageSchema
from ..services import menu_service, page_service
from ..utils.slugify import slugify

bp = Blueprint("pages", __name__)

page_schema = PageSchema()
menu_schema = MenuSchema()
TEMPLATES_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "page_templates.json")
)


@bp.get("")
def list_pages():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    category = request.args.get("category")
    data = page_service.list_pages(page=page, per_page=per_page, category=category)
    return jsonify(
        {"items": page_schema.dump(data["items"], many=True), "meta": data["meta"]}
    )


@bp.post("")
@jwt_required()
def create_page():
    # deprecated: fluxo antigo de criacao manual. Use /pages/with-menu via ContentWizard.
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


@bp.get("/slug/<string:slug>")
def get_page_by_slug(slug: str):
    page = page_service.get_page_by_slug(slug)
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


@bp.post("/with-menu")
@jwt_required()
def create_page_with_menu():
    payload = request.get_json() or {}
    page_payload = payload.get("page") or {}
    # normaliza slug recebido (kebab-case) ou deixa vazio para auto-gerar
    if isinstance(page_payload, dict) and page_payload.get("slug"):
        page_payload["slug"] = slugify(page_payload["slug"])

    try:
        page_data = page_schema.load(page_payload)
    except ValidationError as err:
        return jsonify({"message": "Invalid payload", "errors": err.messages}), 400

    try:
        page = page_service.create_page_in_session(page_data, commit=True)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Slug already exists"}), 409

    if not payload.get("create_menu"):
        return jsonify({"page": page_schema.dump(page)}), 201

    parent_id = payload.get("menu_parent_id")
    if parent_id is not None:
        parent = menu_service.get_menu(parent_id)
        if not parent:
            return jsonify({"message": "Parent menu not found"}), 404

    menu_payload = {
        "label": (page.title_translations or {}).get("pt") or page.slug,
        "slug": page.slug,
        "target": f"/pages/{page.slug}",
        "parent_id": parent_id,
        "order": payload.get("menu_order"),
    }

    try:
        menu = menu_service.create_menu_with_defaults(menu_payload)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Menu creation failed"}), 409

    if parent_id is not None:
        menu_service.ensure_dropdown(parent_id)

    return jsonify({"page": page_schema.dump(page), "menu": menu_schema.dump(menu)}), 201


@bp.post("/bulk-with-menus")
@jwt_required()
def create_pages_bulk_with_menus():
    payload = request.get_json() or {}
    parent_payload = payload.get("parent_page") or {}
    children_payloads = payload.get("children") or []
    if isinstance(parent_payload, dict) and parent_payload.get("slug"):
        parent_payload["slug"] = slugify(parent_payload["slug"])
    if isinstance(children_payloads, list):
        for child in children_payloads:
            if isinstance(child, dict) and child.get("slug"):
                child["slug"] = slugify(child["slug"])
    children_menu_orders = payload.get("children_menu_orders")

    try:
        parent_data = page_schema.load(parent_payload)
        children_data = [page_schema.load(child) for child in children_payloads]
    except ValidationError as err:
        return jsonify({"message": "Invalid payload", "errors": err.messages}), 400

    orders_map: dict[str, int] = {}
    if children_menu_orders is not None:
        if not isinstance(children_menu_orders, list):
            return jsonify({"message": "Invalid children_menu_orders"}), 400
        for item in children_menu_orders:
            if not isinstance(item, dict):
                return jsonify({"message": "Invalid children_menu_orders"}), 400
            slug_or_title = item.get("slug_or_title")
            order_val = item.get("order")
            if slug_or_title is None or not isinstance(order_val, int):
                return jsonify({"message": "Invalid children_menu_orders"}), 400
            orders_map[str(slug_or_title)] = order_val

    parent_page = None
    parent_menu = None
    child_pages = []
    child_menus = []

    try:
        with db.session.begin():
            parent_page = page_service.create_page_in_session(parent_data, commit=False)
            for child_data in children_data:
                child_pages.append(page_service.create_page_in_session(child_data, commit=False))

            if payload.get("create_parent_menu"):
                parent_menu_payload = {
                    "label": (parent_page.title_translations or {}).get("pt") or parent_page.slug,
                    "slug": parent_page.slug,
                    "target": f"/pages/{parent_page.slug}",
                    "parent_id": None,
                    "order": payload.get("menu_order_parent"),
                }
                if parent_menu_payload["order"] is None:
                    parent_menu_payload["order"] = menu_service.next_order(None)

                parent_menu = Menu(**parent_menu_payload)
                db.session.add(parent_menu)
                db.session.flush()

                if payload.get("mark_parent_dropdown"):
                    parent_menu.is_dropdown = True

                if len(child_pages) > 0:
                    parent_menu.is_dropdown = True

                for child_page in child_pages:
                    order_val = orders_map.get(child_page.slug, None)
                    if order_val is None:
                        pt_title = (child_page.title_translations or {}).get("pt")
                        if pt_title:
                            order_val = orders_map.get(pt_title, None)
                    if order_val is None:
                        order_val = menu_service.next_order(parent_menu.id)
                    child_menu_payload = {
                        "label": (child_page.title_translations or {}).get("pt") or child_page.slug,
                        "slug": child_page.slug,
                        "target": f"/pages/{child_page.slug}",
                        "parent_id": parent_menu.id,
                        "order": order_val,
                    }
                    child_menu = Menu(**child_menu_payload)
                    db.session.add(child_menu)
                    db.session.flush()
                    child_menus.append(child_menu)
            # se create_parent_menu for False, apenas páginas são criadas
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Slug or menu conflict"}), 409

    response_body = {
        "parent_page": page_schema.dump(parent_page),
        "child_pages": page_schema.dump(child_pages, many=True),
    }
    if parent_menu:
        response_body["parent_menu"] = menu_schema.dump(parent_menu)
    if child_menus:
        response_body["child_menus"] = menu_schema.dump(child_menus, many=True)

    return jsonify(response_body), 201


def _markdown_to_html_basic(markdown_text: str) -> str:
    """Minimal conversion: # -> h1, ## -> h2, blank -> <p>, others -> <p>."""
    html_lines: list[str] = []
    for line in markdown_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            html_lines.append(f"<h2>{stripped[3:].strip()}</h2>")
        elif stripped.startswith("# "):
            html_lines.append(f"<h1>{stripped[2:].strip()}</h1>")
        elif stripped == "":
            html_lines.append("<p></p>")
        else:
            html_lines.append(f"<p>{stripped}</p>")
    return "\n".join(html_lines)


def load_templates():
    with open(TEMPLATES_PATH, "r", encoding="utf-8") as fp:
        data = json.load(fp)
    if not isinstance(data, list):
        raise ValueError("Templates file must be a list")

    templates = []
    for item in data:
        if not isinstance(item, dict):
            continue
        template = dict(item)
        required = ["id", "name", "content"]
        if any(field not in template for field in required):
            continue
        if template.get("format") == "md" and template.get("content"):
            template["content"] = _markdown_to_html_basic(template["content"])
            template["format"] = "html"
        templates.append(template)
    return templates


@bp.route("/page-templates", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def list_page_templates():
    if request.method == "OPTIONS":
        return "", 200
    try:
        templates = load_templates()
    except FileNotFoundError:
        return jsonify({"message": "Templates file not found"}), 500
    except (json.JSONDecodeError, ValueError):
        return jsonify({"message": "Invalid templates file"}), 500

    return jsonify({"templates": templates}), 200
