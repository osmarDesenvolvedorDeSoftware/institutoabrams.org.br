import re

from flask import Blueprint, jsonify

from ..models import Page
from ..schemas import PageSchema
from ..utils.content import strip_tags

bp = Blueprint("public_seo", __name__)

page_schema = PageSchema()


def _summarize(html: str | None, limit: int = 180) -> str:
  if not html:
    return ""
  text = strip_tags(html)
  return (text[:limit] + "...") if len(text) > limit else text


@bp.get("/<string:slug>")
def seo_by_slug(slug: str):
  page = Page.query.filter_by(slug=slug).first()
  if not page:
    return jsonify({"message": "Not found"}), 404

  data = page_schema.dump(page)
  title = data.get("title_translations", {}).get("pt") or slug
  description = _summarize(data.get("content_translations", {}).get("pt") or "")
  image = data.get("hero_image_url")

  return jsonify(
    {
      "title": title,
      "description": description,
      "image": image,
      "slug": slug,
    }
  )
