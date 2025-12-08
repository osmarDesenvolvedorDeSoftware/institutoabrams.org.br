from flask import Flask

from .auth import bp as auth_bp
from .health import bp as health_bp
from .media import media_api_bp, media_bp
from .menus import bp as menus_bp
from .pages import bp as pages_bp
from .seo import bp as seo_bp
from .sitemap import bp as sitemap_bp
from .settings import bp as settings_bp
from .translations import bp as translations_bp


def register_routes(app: Flask) -> None:
    """Attach all blueprints to the Flask app."""
    prefix = app.config.get("API_PREFIX", "/api/v1")
    app.register_blueprint(health_bp, url_prefix=prefix)
    app.register_blueprint(auth_bp, url_prefix=f"{prefix}/auth")
    app.register_blueprint(pages_bp, url_prefix=f"{prefix}/pages")
    app.register_blueprint(menus_bp, url_prefix=f"{prefix}/menus")
    app.register_blueprint(translations_bp, url_prefix=f"{prefix}/translations")
    app.register_blueprint(seo_bp, url_prefix=f"{prefix}/public/seo")
    app.register_blueprint(settings_bp, url_prefix=f"{prefix}/settings")
    app.register_blueprint(media_api_bp, url_prefix=f"{prefix}/media")
    # uploads are public (sem prefixo /api)
    app.register_blueprint(media_bp)
    app.register_blueprint(sitemap_bp)
