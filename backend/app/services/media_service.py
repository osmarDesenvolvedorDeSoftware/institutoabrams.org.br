import os
import time
import uuid

from flask import current_app
from werkzeug.utils import secure_filename


def save_media(file) -> str:
    """
    Persist an uploaded image and return a public URL path.
    """
    upload_folder = current_app.config.get("UPLOAD_FOLDER")
    media_base_url = current_app.config.get("MEDIA_BASE_URL", "/uploads")

    if not upload_folder:
        raise ValueError("UPLOAD_FOLDER não configurado.")

    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    if not filename:
        raise ValueError("Nome de arquivo inválido.")

    name, ext = os.path.splitext(filename)
    unique_suffix = f"{int(time.time())}_{uuid.uuid4().hex[:8]}"
    final_name = f"{name}_{unique_suffix}{ext}"
    path = os.path.join(upload_folder, final_name)

    file.save(path)

    media_base_url = media_base_url.rstrip("/")
    return f"{media_base_url}/{final_name}"
