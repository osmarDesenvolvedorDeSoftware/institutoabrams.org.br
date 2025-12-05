# Plano inicial - Instituto ABRAMS

## Checklist macro
- [ ] Definir branding, tom e vocabulário (pt/en) para o site e painel
- [x] Configurar `.env` locais com secrets reais (backend e frontend)
- [ ] Subir stack Docker (`docker-compose up`) e validar saúde dos serviços
- [ ] Rodar migrações (`flask db upgrade`) e criar usuário admin inicial
- [x] Criar fluxo de login no painel e proteger rotas admin
- [x] Modelar páginas, menus, oportunidades, leads e traduções (API v1)
- [ ] Publicar build inicial em staging (Traefik) e revisar performance/SEO

## Ordem recomendada de implementação
1) Infra e DevEx: Docker/Traefik, lint/format, scripts de automação
2) Backend básico: auth + CRUDs (páginas, menus, oportunidades, traduções, leads) e migrações
3) Frontend público: rotas estáticas/dinâmicas, layout base e i18n
4) Painel admin: CRUDs completos (páginas, menus, oportunidades, traduções)
5) Observabilidade e hardening: logs estruturados, CORS, rate limit, backup do DB
6) Migração de conteúdo: importar páginas/menus/opps existentes e validar URLs

## Tarefas - Backend (Flask)
- [x] Finalizar config de ambiente real em `backend/.env` e secrets seguros
- [ ] Rodar `flask db upgrade` (0001 + 0002 + 0003) e validar schema no Postgres
- [x] Implementar seed para usuário admin inicial
- [x] Validação básica (marshmallow) e paginação nas listagens
- [ ] Adicionar filtros extras (slug/slug-like, texto) e ordenação configurável
- [ ] Implementar upload/armazenamento de mídia (S3/Cloudflare R2) se necessário
- [ ] Cobrir rotas com testes de API (Pytest + Factory Boy) e fixtures de DB
- [ ] Adicionar rate limiting e logs estruturados (JSON)

## Tarefas - Frontend (React + Vite)
- [ ] Ajustar tema visual/tokens (cores, tipografia, espaçamentos) para identidade ABRAMS
- [x] Conectar API real via `services/api.ts` (/api/v1)
- [x] Implementar login e estado global de sessão no painel
- [x] CRUD inicial de páginas (listar/criar/editar/excluir)
- [x] CRUD inicial de oportunidades
- [x] CRUD visual de menus/submenus (ordenação simples)
- [ ] Gestão de traduções (pt/en/es/fr) no painel
- [ ] Layout final responsivo e componentes compartilhados (botões, cards, tabelas)
- [ ] Otimizar build (code splitting, fontes/imagens autohospedadas)

## Tarefas - Infraestrutura
- [ ] Configurar Traefik com domínios reais/TLS e dashboard protegido
- [ ] Separar redes e variáveis por ambiente; volumes e backup do Postgres
- [ ] Criar pipelines CI/CD (build + tests + deploy) para backend e frontend
- [x] Healthcheck exposto (/api/v1/health) e Traefik apontando para ele

## Tarefas - Migração de conteúdo
- [ ] Mapear URLs antigas -> novas rotas e redirecionamentos
- [ ] Extrair conteúdos existentes (textos, menus, imagens) e planilhar
- [ ] Importar páginas/menus via seeds/scripts usando os CRUDs
- [ ] Validar traduções e termos-chave em pt/en/es/fr
- [ ] Revisar SEO (metadados, sitemap, robots) e acessibilidade básica

## Fase 3 - Branding e Layout
- [x] Aplicar paleta ABRAMS no tema global (global.css)
- [x] Header institucional com idiomas e menus vindos da API
- [x] MenusAdmin para CRUD de navegação
- [x] Páginas públicas alinhadas (Home, Projetos, Oportunidades, Contato)
- [ ] Conteúdo real (textos, imagens, links oficiais)
- [ ] Refinar responsividade e estados de carregamento
- [ ] Ajustar identidade final (logo oficial, tipografia definida)

## Fase 4 - Conteúdo Real e Ajustes Finais
- [x] Slugs estáveis e rota pública `/pages/:slug`
- [x] Seed de admin (dev) via `flask seed-admin`
- [x] Editor de páginas com abas PT/EN/ES/FR e categorias (projeto, contato, institucional)
- [x] Páginas dinâmicas (Quem Somos, Contato, Projetos via CMS)
- [x] Menus carregados do backend e responsividade básica (hambúrguer)
- [ ] Preencher conteúdo definitivo (textos, contatos, links oficiais)
- [ ] Gestão de traduções completa no painel
- [ ] Testes end-to-end e deploy (Fase 5)

## Fase 5 - Deploy local simples + testes + preparação para pitch
- [x] docker-compose.prod.yml sem Traefik (db, backend gunicorn:8000, frontend nginx)
- [x] .env.prod.example com variáveis mínimas
- [x] Testes básicos Pytest (health, páginas, oportunidades, leads)
- [x] PITCH_DEMO.md para roteiro de demonstração
- [ ] Conteúdo real preenchido no CMS para gravação
- [ ] Automação CI para rodar pytest e build docker

Próximo passo → Fase 6 (deploy real na VPS)
