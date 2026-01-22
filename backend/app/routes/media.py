import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required

from ..services import media_service

# API (upload) blueprint, mounted under /api prefix in register_routes
media_api_bp = Blueprint("media_api", __name__)

# Public serving blueprint, mounted at root (no /api prefix)
media_bp = Blueprint("media_public", __name__)


@media_api_bp.post("/upload")
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


@media_api_bp.get("/list")
@jwt_required()
def list_media():
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    media_base_url = current_app.config.get("MEDIA_BASE_URL", "/uploads")

    try:
        files = []
        if os.path.exists(upload_folder):
            for filename in os.listdir(upload_folder):
                filepath = os.path.join(upload_folder, filename)
                if os.path.isfile(filepath):
                    stat = os.stat(filepath)
                    files.append(
                        {
                            "filename": filename,
                            "url": f"{media_base_url}/{filename}",
                            "size": stat.st_size,
                            "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        }
                    )

        files.sort(key=lambda x: x["uploaded_at"], reverse=True)
        return jsonify({"files": files}), 200
    except Exception as exc:
        return jsonify({"message": f"Erro ao listar midia: {str(exc)}"}), 500


@media_bp.get("/uploads/<path:filename>")
def serve_upload(filename):
    upload_dir = current_app.config.get("UPLOAD_FOLDER")
    if not upload_dir:
        return jsonify({"message": "UPLOAD_FOLDER não configurado."}), 500
    os.makedirs(upload_dir, exist_ok=True)
    return send_from_directory(upload_dir, filename)
