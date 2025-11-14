# HelpPet — Plataforma Web + API

Aplicação full‑stack para gestão de uma clínica de reabilitação de animais: vitrine de adoção, fluxo de doações e painel administrativo.


## Demonstração rápida

- Frontend: `http://localhost:5173`
- API/Docs: `http://localhost:3001/docs`
- Login admin: `adm@gmail.com` / `123456`


## Visão geral (para apresentação)

- Propósito: conectar resgates a adotantes e doadores, com operações clínicas (consultas/cirurgias) e gestão administrativa.
- Diferenciais técnicos:
  - Validações robustas no backend (NestJS + class‑validator) e no frontend (RHF + Zod).
  - Tipos e IDs consistentes (UUID no backend; frontend envia e trata `string`).
  - UI moderna com shadcn/ui e Tailwind; experiência mobile‑first.
  - Documentação viva via Swagger e arquitetura modular.


## Arquitetura

- Backend (API): NestJS 10, Prisma ORM, PostgreSQL, JWT Auth, Swagger.
- Frontend (App): React + Vite + TS, React Router, React Query, shadcn/ui, Tailwind, RHF + Zod.
- Banco: PostgreSQL em Docker (porta host 5433 → container 5432).


## Tecnologias

- Backend: NestJS, Prisma, PostgreSQL, Passport/JWT, Swagger.
- Frontend: React 18, Vite, TypeScript, React Router, React Query, RHF/Zod, Tailwind, shadcn/ui.


## Pré‑requisitos

- Node.js 18+
- Docker + Docker Compose


## Subida rápida (3 passos)

1) Banco (Docker)

```bash
cd backend
docker compose up -d postgres
```

2) Backend (API) — configurar, migrar e iniciar

Crie/valide `backend/.env` (já versionado neste projeto para facilitar o setup local):

```
DATABASE_URL="postgresql://user:password@localhost:5433/helppet?schema=public"
JWT_SECRET=helppet-secret-key
JWT_EXPIRES_IN="7d"
PORT=3001
```

Instale deps, gere schema e dados iniciais:

```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:3001` — Docs: `http://localhost:3001/docs`

3) Frontend (Web)

```bash
cd ../frontend
npm install
npm run dev
```

App: `http://localhost:5173`

Obs.: O app aponta por padrão para `http://localhost:3001` (veja `src/lib/api.ts`). Para alterar, defina `VITE_API_URL`.


## Funcionalidades (alto nível)

- Público/Usuário:
  - Catálogo de animais, fluxo de adoção, histórico de solicitações.
  - Doações (itens/valor) para instituições parceiras.
- Administrativo (ADMIN):
  - Dashboard e métricas.
  - CRUDs: animais, cidades, instituições, tutores, veterinários, consultas, cirurgias.


## Estrutura de pastas

- `backend/` — API NestJS (módulos por domínio, Prisma em `prisma/`).
- `frontend/` — App React (componentes, páginas e serviços por recurso).


## Scripts úteis

Backend:

```bash
npm run start:dev     # dev com watch
npm run prisma:seed   # popula dados iniciais (admin, cidades, instituições, animais)
```

Frontend:

```bash
npm run dev           # modo desenvolvimento
npm run build         # build de produção
```


## Boas práticas e decisões

- IDs UUID no banco; o frontend sempre envia/espera `string` (alinhado ao Prisma).
- Backend com `ValidationPipe` e `forbidNonWhitelisted: true` — payloads devem seguir estritamente os DTOs; o frontend já adapta formatos (ex.: doações e instituições).
- CORS habilitado para `http://localhost:5173` e envio de credenciais (JWT).
- Tipagem e UX: formulários em RHF com Zod, selects convertem valores corretamente; máscaras compatíveis com React 18 sem `findDOMNode`.


## Acesso via celular (mesma rede)

- Use o IP do seu computador (não `localhost`):
  - Backend: `http://SEU_IP:3001`
  - Frontend: `http://SEU_IP:5173`
- Altere `VITE_API_URL` para apontar ao IP: `export VITE_API_URL="http://SEU_IP:3001"`.


## Troubleshooting

- Porta 3001 ocupada (EADDRINUSE):
  - macOS: `lsof -nP -iTCP:3001 | grep LISTEN` → `kill -9 <PID>`

- Login 500/401:
  - Garanta Postgres ativo (Docker em 5433), `DATABASE_URL` correto e seed executado.
  - Verifique `.env` e reinicie `npm run start:dev`.

- Erros 400 na API (validação):
  - O backend rejeita campos extras; o front já envia somente o necessário.
  - Se customizar payloads, siga os DTOs em `backend/src/**/dto`.

- Teste rápido do login:
  ```bash
  curl -i -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"adm@gmail.com","password":"123456"}'
  ```


## Publicação (Git/GitHub)

O projeto já está versionado (inclui `.env` apenas para ambiente local). Para publicar no seu repositório:

```bash
git remote add origin git@github.com:<usuario>/helppet.git
git push -u origin main
```

Se usar HTTPS + token (PAT):

```bash
git remote add origin https://github.com/<usuario>/helppet.git
git push -u origin main
```


## Credenciais de demonstração

- Admin: `adm@gmail.com` / `123456`


---

Obrigado por testar o HelpPet. Qualquer ajuste/bug — abra uma issue ou entre em contato! 
