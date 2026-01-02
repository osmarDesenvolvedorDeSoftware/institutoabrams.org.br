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

    demo_images = {
        "hero": "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80",
        "team": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        "class": "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
        "library": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        "mentorship": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80",
        "portfolio": "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80",
        "donation": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    }

    pages_to_seed = [
        {
            "title": "Quem Somos",
            "slug": "quem-somos",
            "category": "institucional",
            "hero_image_url": demo_images["team"],
            "content": "<p>Somos um instituto social dedicado a ampliar oportunidades por meio de educacao, cultura e mentoria.</p><p>Nossa missao e construir pontes entre pessoas, conhecimento e futuro.</p>",
        },
        {
            "title": "Transparencia",
            "slug": "transparencia",
            "category": "institucional",
            "content": "<p>Publicamos nossos relatorios, parcerias e indicadores para manter a transparencia com a comunidade.</p>",
        },
        {
            "title": "Projetos",
            "slug": "projetos",
            "category": "institucional",
            "hero_image_url": demo_images["class"],
            "content": "<p>Conheca nossas iniciativas em educacao, leitura, igualdade e carreiras. Cada projeto nasce de um diagnostico real e evolui com a comunidade.</p>",
        },
        {
            "title": "Noticias",
            "slug": "noticias",
            "category": "institucional",
            "hero_image_url": demo_images["portfolio"],
            "content": "<p>Fique por dentro das ultimas acoes, parcerias e novidades do instituto.</p>",
        },
        {
            "title": "Portfolio",
            "slug": "portfolio",
            "category": "institucional",
            "hero_image_url": demo_images["portfolio"],
            "content": "<p>Registro visual e institucional das nossas entregas e eventos.</p>",
        },
        {
            "title": "Doacao",
            "slug": "doacao",
            "category": "institucional",
            "hero_image_url": demo_images["donation"],
            "content": "<p>Seu apoio transforma vidas. Contribua com nossos projetos e ajude a construir um futuro melhor.</p>",
        },
        {
            "title": "Voluntariado",
            "slug": "voluntariado",
            "category": "institucional",
            "content": "<p>Junte-se ao nosso time de voluntarios e contribua com tempo, conhecimento e impacto.</p>",
        },
        {
            "title": "Parceiros",
            "slug": "parceiros",
            "category": "institucional",
            "content": "<p>Empresas e organizacoes que caminham com a gente na transformacao social.</p>",
        },
        {
            "title": "Contato",
            "slug": "contato",
            "category": "contato",
            "content": "<p>Fale com o instituto e saiba como participar. Responderemos o mais breve possivel.</p>",
        },
        {
            "title": "Clubinho da Leitura",
            "slug": "clubinho-da-leitura",
            "category": "projeto",
            "hero_image_url": demo_images["library"],
            "gallery_urls": [demo_images["library"], demo_images["class"]],
            "video_url": "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            "content": "<p>Projeto voltado ao incentivo a leitura e ao desenvolvimento do pensamento critico em criancas e adolescentes.</p>",
        },
        {
            "title": "Igualdade de Genero",
            "slug": "igualdade-de-genero",
            "category": "projeto",
            "hero_image_url": demo_images["team"],
            "gallery_urls": [demo_images["team"], demo_images["portfolio"]],
            "content": "<p>Formacao e dialogo para promover respeito, equidade e oportunidades.</p>",
        },
        {
            "title": "Trilhas de Carreira",
            "slug": "trilhas-de-carreira",
            "category": "projeto",
            "hero_image_url": demo_images["mentorship"],
            "gallery_urls": [demo_images["mentorship"], demo_images["class"]],
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "content": "<p>Mentorias e trilhas formativas para apoiar jovens na entrada no mercado.</p>",
        },
        {
            "title": "Mentorias Profissionais",
            "slug": "mentorias-profissionais",
            "category": "projeto",
            "hero_image_url": demo_images["mentorship"],
            "content": "<p>Conexoes com profissionais e rodas de conversa para ampliar horizontes.</p>",
        },
        {
            "title": "Cursos / Servicos",
            "slug": "cursos",
            "category": "projeto",
            "hero_image_url": demo_images["class"],
            "content": "<p>Cursos e servicos sociais criados a partir das demandas locais.</p>",
        },
        {
            "title": "Educacao e Cultura",
            "slug": "educacao-e-cultura",
            "category": "projeto",
            "hero_image_url": demo_images["class"],
            "content": "<p>Programas de formacao, oficinas culturais e acesso a conhecimento.</p>",
        },
        {
            "title": "Saude e Bem-Estar",
            "slug": "saude-e-bem-estar",
            "category": "projeto",
            "hero_image_url": demo_images["team"],
            "content": "<p>Acoes de prevencao, orientacao e cuidado comunitario.</p>",
        },
        {
            "title": "Empreendedorismo Social",
            "slug": "empreendedorismo-social",
            "category": "projeto",
            "hero_image_url": demo_images["portfolio"],
            "content": "<p>Formacao empreendedora e apoio a iniciativas locais sustentaveis.</p>",
        },
        {
            "title": "Conteudo da Home",
            "slug": "home-content",
            "category": "especial",
            "sections": [
                {
                    "type": "hero",
                    "title": "Instituto ABRAMS",
                    "subtitle": "Educacao, cultura e oportunidades para transformar realidades.",
                    "button_text": "Conheca nossos projetos",
                    "button_url": "/pages/projetos",
                    "image_url": demo_images["hero"],
                },
                {
                    "type": "text",
                    "content": "Apoiamos comunidades com programas de leitura, mentoria e formacao.",
                },
                {
                    "type": "image",
                    "image_url": demo_images["team"],
                    "caption": "Equipe e voluntarios em acao.",
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
                "content_translations": {"pt": p.get("content") or "Conteudo em construcao."},
                "slug": p["slug"],
                "category": p.get("category"),
                "sections": p.get("sections"),
                "hero_image_url": p.get("hero_image_url"),
                "gallery_urls": p.get("gallery_urls"),
                "video_url": p.get("video_url"),
                "is_published": True,
            },
            commit=True,
        )

    menu_structure = [
        {"label": "Inicio", "slug": "home", "target": "/", "order": 1, "is_dropdown": False, "children": []},
        {
            "label": "Instituto",
            "slug": "instituto",
            "target": "/pages/quem-somos",
            "order": 2,
            "is_dropdown": True,
            "children": [
                {"label": "Quem Somos", "slug": "quem-somos"},
                {"label": "Transparencia", "slug": "transparencia"},
                {"label": "Parceiros", "slug": "parceiros"},
            ],
        },
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
                {"label": "Educacao e Cultura", "slug": "educacao-e-cultura"},
                {"label": "Saude e Bem-Estar", "slug": "saude-e-bem-estar"},
                {"label": "Empreendedorismo Social", "slug": "empreendedorismo-social"},
            ],
        },
        {"label": "Noticias", "slug": "noticias", "target": "/pages/noticias", "order": 4, "is_dropdown": False, "children": []},
        {"label": "Portfolio", "slug": "portfolio", "target": "/pages/portfolio", "order": 5, "is_dropdown": False, "children": []},
        {"label": "Voluntariado", "slug": "voluntariado", "target": "/pages/voluntariado", "order": 6, "is_dropdown": False, "children": []},
        {"label": "Doacao", "slug": "doacao", "target": "/pages/doacao", "order": 7, "is_dropdown": False, "children": []},
        {"label": "Contato", "slug": "contato", "target": "/pages/contato", "order": 8, "is_dropdown": False, "children": []},
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

    from .services import setting_service

    setting_service.upsert_setting(
        "site_branding",
        {
            "logo_url": "https://placehold.co/160x60/png?text=Instituto+ABRAMS",
            "favicon_url": "https://placehold.co/64x64/png?text=IA",
        },
    )
    setting_service.upsert_setting(
        "footer",
        {
            "address": "Av. Central, 123 - Sao Paulo, SP",
            "email": "contato@institutoabrams.org",
            "phone": "+55 (11) 99999-9999",
            "cnpj": "12.345.678/0001-90",
            "social": {
                "youtube": "https://www.youtube.com/@institutoabrams",
                "instagram": "https://www.instagram.com/institutoabrams/",
                "facebook": "https://www.facebook.com/institutoabrams",
                "linkedin": "https://www.linkedin.com/company/institutoabrams/",
            },
        },
    )
    return f"Menus/Paginas semeados: {created_or_updated}"
