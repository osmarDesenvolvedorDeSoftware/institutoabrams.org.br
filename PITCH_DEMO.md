# Pitch / Demo – Instituto ABRAMS

## Subir ambiente (produção local simples)
1) Criar `.env.prod` na raiz a partir de `.env.prod.example`.
2) `docker-compose -f docker-compose.prod.yml up --build`
3) Acessos:
   - Frontend: http://localhost:8080
   - API: http://localhost:8000/api/v1/health
   - Admin (login): http://localhost:8080/admin/login
   - Credenciais seed (dev): admin@abrams.org / admin123

## Funcionalidades para demonstrar
- Login admin e painel protegido.
- Criar/editar páginas (multi-idioma PT/EN/ES/FR) com slug estável.
- Gestão de menus (incluindo dropdowns e ordem simples).
- Oportunidades (criar/listar/filtrar).
- Páginas dinâmicas em `/pages/:slug` (ex.: Quem Somos, Contato, Projetos via CMS).
- Suporte multi-idioma com fallback para PT.
- Responsividade básica (header com hambúrguer no mobile).

## Fluxo sugerido no vídeo
1) Mostrar home pública e navegação (menus, idiomas).
2) Login no admin e overview.
3) Criar/editar uma página (ex.: “Quem Somos”) e mostrar no site público.
4) Criar uma oportunidade e mostrar na listagem pública.
5) Ajustar menu para incluir nova página e validar no header.
