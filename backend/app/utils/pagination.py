from ..extensions import db


def paginate(query, page: int = 1, per_page: int = 10):
    """Return paginated items with meta bounded to sane defaults."""
    page = max(1, page or 1)
    per_page = min(max(1, per_page or 10), 50)
    pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)
    return {
        "items": pagination.items,
        "meta": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
            "total": pagination.total,
        },
    }
