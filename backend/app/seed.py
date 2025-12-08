from .services import menu_service, page_service
from .services.auth_service import create_user


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
    using the unified ContentWizard-friendly flow.
    """
    from .extensions import db
    from .models import Menu, Page
    from .utils.slugify import slugify

    pages_to_seed = [
        {"title": "Quem Somos", "slug": "quem-somos", "category": "institucional"},
        {"title": "Projetos", "slug": "projetos", "category": "institucional"},
        {"title": "Noticias", "slug": "noticias", "category": "institucional"},
        {"title": "Portfolio", "slug": "portfolio", "category": "institucional"},
        {"title": "Doacao", "slug": "doacao", "category": "institucional"},
        {"title": "Contato", "slug": "contato", "category": "contato"},
        {"title": "Clubinho da Leitura", "slug": "clubinho-da-leitura", "category": "projeto"},
        {"title": "Igualdade de Genero", "slug": "igualdade-de-genero", "category": "projeto"},
        {"title": "Trilhas de Carreira", "slug": "trilhas-de-carreira", "category": "projeto"},
        {"title": "Mentorias Profissionais", "slug": "mentorias-profissionais", "category": "projeto"},
        {"title": "Cursos / Servicos", "slug": "cursos", "category": "projeto"},
        {
            "title": "Conteudo da Home",
            "slug": "home-content",
            "category": "especial",
            "sections": [
                {
                    "type": "hero",
                    "title": "Bem-vindo ao Instituto",
                    "subtitle": "Transformando vidas",
                    "button_text": "Saiba mais",
                    "button_url": "/contato",
                    "image_url": "/static/hero.jpg",
                },
                {
                    "type": "text",
                    "content": "Este conteudo e totalmente gerenciavel pelo CMS.",
                },
            ],
        },
    ]

    for p in pages_to_seed:
        existing = Page.query.filter_by(slug=p["slug"]).first()
        if existing:
            continue
        page_service.create_page_in_session(
            {
                "title_translations": {"pt": p["title"]},
                "content_translations": {"pt": "Conteudo em construcao."},
                "slug": p["slug"],
                "category": p.get("category"),
                "sections": p.get("sections"),
                "is_published": True,
            },
            commit=True,
        )

    menu_structure = [
        {"label": "Inicio", "slug": "home", "target": "/", "order": 1, "is_dropdown": False, "children": []},
        {"label": "Quem Somos", "slug": "quem-somos", "target": "/pages/quem-somos", "order": 2, "is_dropdown": False, "children": []},
        {
            "label": "Projetos e Servicos",
            "slug": "projetos",
            "target": "/pages/projetos",
            "order": 3,
            "is_dropdown": True,
            "children": [
                {"label": "Clubinho da Leitura", "slug": "clubinho-da-leitura"},
                {"label": "Igualdade de Genero", "slug": "igualdade-de-genero"},
                {"label": "Trilhas de Carreira", "slug": "trilhas-de-carreira"},
                {"label": "Mentorias Profissionais", "slug": "mentorias-profissionais"},
                {"label": "Cursos / Servicos", "slug": "cursos"},
            ],
        },
        {"label": "Noticias", "slug": "noticias", "target": "/pages/noticias", "order": 4, "is_dropdown": False, "children": []},
        {"label": "Portfolio", "slug": "portfolio", "target": "/pages/portfolio", "order": 5, "is_dropdown": False, "children": []},
        {"label": "Doacao", "slug": "doacao", "target": "/pages/doacao", "order": 6, "is_dropdown": False, "children": []},
        {"label": "Contato", "slug": "contato", "target": "/pages/contato", "order": 7, "is_dropdown": False, "children": []},
    ]

    created_or_updated = 0

    def upsert_menu(label: str, target: str, is_dropdown: bool, parent_id: int | None, order: int, slug_val: str | None = None):
        nonlocal created_or_updated
        existing = Menu.query.filter_by(target=target, parent_id=parent_id).first()
        slug_value = slug_val or slugify(label)
        if existing:
            existing.label = label
            existing.slug = slug_value
            existing.is_dropdown = is_dropdown
            existing.order = order
        else:
            menu_service.create_menu_with_defaults(
                {
                    "label": label,
                    "slug": slug_value,
                    "target": target,
                    "is_dropdown": is_dropdown,
                    "parent_id": parent_id,
                    "order": order,
                }
            )
        created_or_updated += 1

    for item in menu_structure:
        upsert_menu(
            item["label"],
            item["target"],
            item.get("is_dropdown", False),
            None,
            item.get("order", 0),
            slug_val=item.get("slug"),
        )
        parent = Menu.query.filter_by(target=item["target"], parent_id=None).first()
        for idx, child in enumerate(item.get("children", [])):
            upsert_menu(
                child["label"],
                menu_service.normalize_target(child.get("slug")),
                False,
                parent.id if parent else None,
                idx + 1,
                slug_val=child.get("slug"),
            )

    db.session.commit()
    return f"Menus/Paginas semeados: {created_or_updated}"
