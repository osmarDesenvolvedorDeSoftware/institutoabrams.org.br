# Instituto ABRAMS – stack inicial

Backend Flask (API v1), frontend React + Vite e infraestrutura com Docker (dev e prod local).

## Como rodar o backend (dev)
1) `cd backend`
2) Crie `.env` a partir de `.env.example` (ajuste `DATABASE_URL`, `JWT_SECRET_KEY` ou `JWT_SECRET`, `BACKEND_CORS_ORIGINS`, `API_PREFIX`).
3) Ambiente Python 3.12:  
   ```bash
   python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4) Migrações: `flask db upgrade`
5) Suba a API: `flask --app wsgi run --debug`
6) Healthcheck: `GET /api/v1/health`
7) Seed admin (dev): `flask seed-admin` (cria admin@abrams.org / admin123). No Flask shell: `from app.seed import seed_admin; seed_admin()`.

## Como rodar o frontend (dev)
1) `cd frontend`
2) Crie `.env` a partir de `.env.example` (ajuste `VITE_API_BASE_URL`, ex: `http://localhost:5000/api/v1`).
3) Instale deps: `npm install`
4) Suba o dev server: `npm run dev` (porta 5173)
5) Tema/estilo: edite `frontend/src/styles/global.css` (variáveis `--primary`, tipografia) e layouts em `frontend/src/routes/public/*`.
6) Menus e textos: menus vêm do backend (`/api/v1/menus`, editáveis em Admin > Menus em `/admin/menus`); i18n está em `frontend/src/i18n/config.ts`.
7) Páginas institucionais: edite no painel `/admin/paginas` (título/conteúdo por idioma, categoria). Slugs são gerados a partir do título em PT e servem as rotas públicas `/pages/:slug`. Páginas especiais: quem-somos (`/quem-somos`), contato (`/contato`), projetos (categoria `projeto`).
8) Traduções: preencher campos por idioma na aba do editor; fallback para PT se vazio.
9) Menus: gerencie em `/admin/menus` e publique links para páginas dinâmicas (`/pages/:slug`) ou rotas fixas.

## Conteúdo e traduções
- Páginas dinâmicas: `/pages/:slug` busca conteúdo do CMS (slug não muda após criação).
- Traduções: cada página tem abas PT/EN/ES/FR; se um idioma não estiver preenchido, a UI cai para PT.
- Páginas institucionais sugeridas: `quem-somos`, `contato`, projetos com categoria `projeto`.

## Como subir tudo com Docker (dev + Traefik)
1) Na raiz: `docker-compose up --build`
2) Rotas:
   - Backend: http://api.localhost → health em `/api/v1/health`
   - Frontend: http://localhost
3) Postgres com volume nomeado `pgdata`.

### Ambiente de produção local simples (sem Traefik)
1) Copie `.env.prod.example` para `.env.prod` e ajuste secrets/DB.
2) `docker-compose -f docker-compose.prod.yml up --build`
3) Acessos:
   - API: http://localhost:8000/api/v1/health
   - Frontend: http://localhost:8080
   - Admin: http://localhost:8080/admin/login

## Endpoints principais
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- Páginas: CRUD `/api/v1/pages`
- Menus: CRUD `/api/v1/menus`
- Oportunidades: CRUD `/api/v1/opportunities` (+ filtros `status`, `category`)
- Leads: `POST /api/v1/leads` (público), `GET /api/v1/leads` (JWT)
- Traduções: CRUD `/api/v1/translations`
- Páginas: slug único, rota pública `/api/v1/pages/slug/<slug>`

## Frontend
- Rotas públicas: Home, Projetos, Oportunidades, Contato (captura lead)
- Páginas dinâmicas: `/pages/:slug` (carrega conteúdo do CMS). Especial: `/quem-somos`, `/contato`, `/projetos` (categoria projeto).
- Painel admin (login) com gestão de páginas, menus e oportunidades.
- i18n pt/en prontos; placeholders para es/fr.

## Testes
```bash
cd backend
pytest -vv
```

## Próximos passos rápidos
- Ajustar branding/estilo e UX do painel.
- Completar CRUD visual de menus e traduções.
- Adicionar testes (API e UI) e pipeline CI.
