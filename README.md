# Instituto ABRAMS – stack inicial

Backend Flask (API v1), frontend React + Vite e infraestrutura com Docker, Traefik e PostgreSQL.

## Como rodar o backend (dev)
1) `cd backend`
2) Crie `.env` a partir de `.env.example` (ajuste `DATABASE_URL`, `JWT_SECRET_KEY`, `BACKEND_CORS_ORIGINS`, `API_PREFIX`).
3) Ambiente Python 3.12:  
   ```bash
   python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4) Migrações: `flask db upgrade`
5) Suba a API: `flask --app wsgi run --debug`
6) Healthcheck: `GET /api/v1/health`

## Como rodar o frontend (dev)
1) `cd frontend`
2) Crie `.env` a partir de `.env.example` (ajuste `VITE_API_BASE_URL`, ex: `http://localhost:5000/api/v1`).
3) Instale deps: `npm install`
4) Suba o dev server: `npm run dev` (porta 5173)
5) Tema/estilo: edite `frontend/src/styles/global.css` (variáveis `--primary`, tipografia) e layouts em `frontend/src/routes/public/*`.
6) Menus e textos: menus vêm do backend (`/api/v1/menus`, editáveis em Admin > Menus em `/admin/menus`); i18n está em `frontend/src/i18n/config.ts`.

## Como subir tudo com Docker
1) Na raiz: `docker-compose up --build`
2) Rotas:
   - Backend: http://api.localhost (Traefik) → health em `/api/v1/health`
   - Frontend: http://localhost
3) Postgres com volume nomeado `pgdata`.

## Endpoints principais
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- Páginas: CRUD `/api/v1/pages`
- Menus: CRUD `/api/v1/menus`
- Oportunidades: CRUD `/api/v1/opportunities` (+ filtros `status`, `category`)
- Leads: `POST /api/v1/leads` (público), `GET /api/v1/leads` (JWT)
- Traduções: CRUD `/api/v1/translations`

## Frontend
- Rotas públicas: Home, Projetos, Oportunidades, Contato (captura lead)
- Painel admin (login) com gestão inicial de páginas e oportunidades.
- i18n pt/en prontos; placeholders para es/fr.

## Próximos passos rápidos
- Ajustar branding/estilo e UX do painel.
- Completar CRUD visual de menus e traduções.
- Adicionar testes (API e UI) e pipeline CI.
