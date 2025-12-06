# Instituto ABRAMS – stack inicial

Backend Flask (API v1), frontend React + Vite e infraestrutura com Docker (dev e prod local). O scaffold antigo em Next.js foi removido.

## Backend (dev)
1) `cd backend`
2) Crie `.env` a partir de `backend/.env.example` (ajuste `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `API_PREFIX`).
3) Ambiente Python 3.12:
   ```bash
   python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4) Migrações: `flask db upgrade`
5) Suba a API: `flask --app wsgi run --debug`
6) Healthcheck: `GET /api/v1/health`
7) Seed admin (dev): `flask seed-admin` (admin@abrams.org / admin123). Via shell: `from app.seed import seed_admin; seed_admin()`.

## Frontend (dev)
1) `cd frontend`
2) Crie `.env` a partir de `frontend/.env.example` (ex: `VITE_API_BASE_URL=http://localhost:8000/api/v1`).
3) `npm install`
4) `npm run dev` (porta 5173)
5) Menus: via painel `/admin/menus`; páginas em `/admin/paginas`; oportunidades em `/admin/oportunidades`.

## Conteúdo e traduções
- Páginas dinâmicas: `/pages/:slug` (slug gerado do título PT; não muda após criação).
- Idiomas: abas PT/EN/ES/FR; se vazio, fallback para PT.
- Páginas sugeridas: `quem-somos`, `contato`, projetos (categoria `projeto`).

## Docker (dev + Traefik)
1) Na raiz: `docker-compose up --build`
2) Rotas: Backend http://api.localhost (`/api/v1/health`), Frontend http://localhost

### Produção local simples (sem Traefik)
1) Copie `.env.prod.example` → `.env.prod` e ajuste secrets/DB.
2) `docker-compose -f docker-compose.prod.yml up --build`
3) Acessos:
   - API: http://localhost:8000/api/v1/health
   - Frontend: http://localhost:8080
   - Admin: http://localhost:8080/admin/login

## Endpoints principais
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- Páginas: CRUD `/api/v1/pages` (rota pública por slug `/api/v1/pages/slug/<slug>`)
- Menus: CRUD `/api/v1/menus`
- Oportunidades: CRUD `/api/v1/opportunities` (+ filtros `status`, `category`)
- Leads: `POST /api/v1/leads` (público), `GET /api/v1/leads` (JWT)
- Traduções: CRUD `/api/v1/translations`

## Testes
```bash
cd backend
pytest -vv
```

## Ambiente staging/local para demo
1) Configure `.env.prod` na raiz.
2) `docker-compose -f docker-compose.prod.yml up --build`
3) Seed admin (staging apenas se necessário) para acessar `/admin/login`.
4) Crie páginas/menus/oportunidades e valide no site público (`/pages/:slug`, `/quem-somos`, `/contato`, `/projetos`).

## Future Media Module (placeholder only)
- Estrutura inicial criada para um futuro módulo de upload, mas ainda não está ativa.
- Componentes de placeholder estão no frontend e um serviço stub no backend aguardando implementação real.
