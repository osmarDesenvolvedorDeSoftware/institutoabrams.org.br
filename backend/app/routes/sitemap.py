from datetime import datetime

from flask import Blueprint, Response, current_app, request

from ..models import Page

bp = Blueprint("sitemap", __name__)


def _abs_url(path: str) -> str:
    base = request.url_root.rstrip("/")
    if path.startswith("http"):
        return path
    if not path.startswith("/"):
        path = "/" + path
    return f"{base}{path}"


@bp.get("/sitemap.xml")
def sitemap():
    static_paths = [("/", 1.0)]

    urls = []
    today = datetime.utcnow().date().isoformat()
    for path, priority in static_paths:
        urls.append(f"""
  <url>
    <loc>{_abs_url(path)}</loc>
    <lastmod>{today}</lastmod>
    <priority>{priority}</priority>
  </url>""")

    pages = Page.query.filter_by(is_published=True).all()
    for page in pages:
        if page.slug == "home-content":
            continue
        lastmod = (page.updated_at or page.created_at or datetime.utcnow()).date().isoformat()
        urls.append(f"""
  <url>
    <loc>{_abs_url(f"/pages/{page.slug}")}</loc>
    <lastmod>{lastmod}</lastmod>
    <priority>0.6</priority>
  </url>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{''.join(urls)}
</urlset>"""
    return Response(xml, mimetype="application/xml")


@bp.get("/robots.txt")
def robots():
    sitemap_url = _abs_url("/sitemap.xml")
    lines = [
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {sitemap_url}",
    ]
    return Response("\n".join(lines), mimetype="text/plain")
