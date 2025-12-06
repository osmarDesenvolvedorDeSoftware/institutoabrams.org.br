from flask import Blueprint, current_app, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required

from ..services import media_service

media_bp = Blueprint("media", __name__)
uploads_bp = Blueprint("uploads", __name__)


@media_bp.post("/upload")
@jwt_required()
def upload_media():
    if "file" not in request.files:
        return jsonify({"message": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"message": "Arquivo inválido"}), 400

    if file.mimetype not in ["image/png", "image/jpeg", "image/webp"]:
        return jsonify({"message": "Somente imagens PNG, JPEG ou WEBP são permitidas."}), 400

    try:
        url = media_service.save_media(file)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    return jsonify({"url": url})


@uploads_bp.get("/uploads/<path:filename>")
def serve_upload(filename):
    upload_dir = current_app.config.get("UPLOAD_FOLDER")
    return send_from_directory(upload_dir, filename)
