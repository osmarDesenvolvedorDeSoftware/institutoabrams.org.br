from .services.auth_service import create_user
from .services import menu_service, page_service


def seed_admin():
    """Seed a default admin user for development (idempotent)."""
    from .models import User  # imported here to avoid circular deps

    email = "admin@abrams.org"
    if User.query.filter_by(email=email).first():
        return "Admin already exists"

    create_user(email=email, name="Admin", password="admin123", is_admin=True)
    return "Admin created"


def seed_navigation():
    """
    Idempotent seeding of initial menus and placeholder pages
    to mirror the official site navigation.
    """
    from .extensions import db
    from .models import Menu, Page
    from .utils.slugify import slugify

    # Pages to ensure exist
    pages_to_seed = [
      {"title": "Quem Somos", "slug": "quem-somos", "category": "institucional"},
      {"title": "Notícias", "slug": "noticias", "category": "institucional"},
      {"title": "Portfólio", "slug": "portfolio", "category": "institucional"},
      {"title": "Doação", "slug": "doacao", "category": "institucional"},
      {"title": "Contato", "slug": "contato", "category": "contato"},
      {"title": "Clubinho da Leitura", "slug": "clubinho-da-leitura", "category": "projeto"},
      {"title": "Igualdade de Gênero", "slug": "igualdade-de-genero", "category": "projeto"},
      {"title": "Trilhas de Carreira", "slug": "trilhas-de-carreira", "category": "projeto"},
      {"title": "Mentorias Profissionais", "slug": "mentorias-profissionais", "category": "projeto"},
      {"title": "Cursos / Serviços", "slug": "cursos", "category": "projeto"},
    ]

    for p in pages_to_seed:
        existing = Page.query.filter_by(slug=p["slug"]).first()
        if existing:
            continue
        page_service.create_page(
            {
                "title_translations": {"pt": p["title"]},
                "content_translations": {"pt": "Conteúdo em construção."},
                "slug": p["slug"],
                "category": p.get("category"),
                "is_published": True,
            }
        )

    menu_structure = [
        {"label": "Início", "target": "/", "order": 1, "is_dropdown": False, "children": []},
        {"label": "Quem Somos", "target": "/quem-somos", "order": 2, "is_dropdown": False, "children": []},
        {
            "label": "Projetos e Serviços",
            "target": "/projetos",
            "order": 3,
            "is_dropdown": True,
            "children": [
                {"label": "Clubinho da Leitura", "target": "/pages/clubinho-da-leitura"},
                {"label": "Igualdade de Gênero", "target": "/pages/igualdade-de-genero"},
                {"label": "Trilhas de Carreira", "target": "/pages/trilhas-de-carreira"},
                {"label": "Mentorias Profissionais", "target": "/pages/mentorias-profissionais"},
                {"label": "Cursos / Serviços", "target": "/pages/cursos"},
            ],
        },
        {"label": "Notícias", "target": "/noticias", "order": 4, "is_dropdown": False, "children": []},
        {"label": "Portfólio", "target": "/portfolio", "order": 5, "is_dropdown": False, "children": []},
        {"label": "Oportunidades", "target": "/oportunidades", "order": 6, "is_dropdown": False, "children": []},
        {"label": "Doação", "target": "/doacao", "order": 7, "is_dropdown": False, "children": []},
        {"label": "Contato", "target": "/contato", "order": 8, "is_dropdown": False, "children": []},
    ]

    created_or_updated = 0

    def upsert_menu(label: str, target: str, is_dropdown: bool, parent_id: int | None, order: int):
        nonlocal created_or_updated
        existing = Menu.query.filter_by(target=target, parent_id=parent_id).first()
        slug_val = slugify(label)
        if existing:
            existing.label = label
            existing.slug = slug_val
            existing.is_dropdown = is_dropdown
            existing.order = order
        else:
            menu_service.create_menu(
                {
                    "label": label,
                    "slug": slug_val,
                    "target": target,
                    "is_dropdown": is_dropdown,
                    "parent_id": parent_id,
                    "order": order,
                }
            )
        created_or_updated += 1

    for item in menu_structure:
        upsert_menu(item["label"], item["target"], item.get("is_dropdown", False), None, item.get("order", 0))
        parent = Menu.query.filter_by(target=item["target"], parent_id=None).first()
        for idx, child in enumerate(item.get("children", [])):
            upsert_menu(child["label"], child["target"], False, parent.id if parent else None, idx)

    db.session.commit()
    return f"Menus/Páginas semeados: {created_or_updated}"
