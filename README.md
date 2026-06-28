# Fluxy

Fluxy é uma plataforma SaaS de gestão inteligente para empresas digitais. A interface combina visual moderno, dados operacionais e análise estratégica em um painel único.

![Fluxy Dashboard](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=for-the-badge&logo=mongodb)

---

## Visão geral

Fluxy foi projetada para equipes que precisam acompanhar receita, entregas, clientes e fluxo de caixa com clareza e agilidade. A identidade visual segue uma linguagem premium com gradientes sofisticados e componentes alinhados a experiências de grandes marcas.

---

## Funcionalidades principais

- Dashboard de receita, lucro e despesa
- Indicadores de crescimento e metas
- Gestão de clientes ativos
- Controle de recebimentos e pagamentos
- Monitoramento de entregas e prazos
- Relatórios e métricas em tempo real
- Interface responsiva e elegante

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Banco de Dados | MongoDB 7 + Mongoose |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Infra | Docker Compose |

---

## Estrutura do projeto

```text
Fluxy/
├── README.md
├── docker-compose.yml
├── package.json
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/db.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── seeds/seed.ts
│   └── .env.example
└── frontend/
    ├── package.json
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── meu-negocio/page.tsx
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── business/
    │   │   ├── clients/
    │   │   ├── deliveries/
    │   │   ├── financeiro/
    │   │   ├── portfolio/
    │   │   ├── perfil/
    │   │   └── ui/
    │   ├── lib/
    │   └── types/
    └── public/
```

---

## Requisitos

- Node.js 18+
- Docker Desktop
- Git (opcional)

---

## Configuração rápida

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Copiar variáveis de ambiente

```bash
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
```

### 3. Iniciar infraestrutura

```bash
docker compose up -d
```

### 4. Executar seed

```bash
cd backend
npm run seed
```

### 5. Iniciar backend

```bash
cd backend
npm run dev
```

### 6. Iniciar frontend

```bash
cd frontend
npm run dev
```

A aplicação será acessível em: **http://localhost:3000/meu-negocio**

---

## Scripts úteis

### Raiz

| Script | Descrição |
|--------|-----------|
| `npm run install:all` | Instala dependências do backend e frontend |
| `npm run dev:backend` | Inicia backend em modo dev |
| `npm run dev:frontend` | Inicia frontend em modo dev |
| `npm run seed` | Executa script seed do backend |

### Backend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia API em modo dev |
| `npm run build` | Compila TypeScript do backend |
| `npm run start` | Inicia backend compilado |
| `npm run seed` | Popula banco com dados de exemplo |

### Frontend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia Next.js em modo dev |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia aplicação em produção |

---

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/business/dashboard` | Dashboard completo |
| `GET` | `/api/business/summary` | Resumo de KPIs |
| `GET` | `/api/business/growth` | Indicadores de crescimento |
| `GET` | `/api/business/history` | Histórico mensal |
| `GET` | `/api/business/payments/upcoming` | Pagamentos agendados |
| `GET` | `/api/business/deliveries/upcoming` | Entregas agendadas |
| `GET` | `/api/business/clients/active` | Clientes ativos |

---

## Coleções MongoDB

| Coleção | Descrição |
|---------|-----------|
| `clients` | Gestão de clientes |
| `payments` | Recebimentos e status |
| `deliveries` | Entregas e prazos |
| `businessmetrics` | Métricas e indicadores |

---

## Seed de exemplo

O seed cria dados fictícios prontos para desenvolvimento:

- 10 clientes
- 8 recebimentos
- 8 entregas
- Métricas mensais com histórico relevante

Para rodar novamente:

```bash
cd backend && npm run seed
```

---

## Observações

- A aplicação foi ajustada para a marca Fluxy com estilo premium.
- O frontend usa Tailwind CSS e animações suaves para melhorar a experiência.
- O backend exige `JWT_SECRET` e `MONGODB_URI` em produção.

## Variáveis de Ambiente

### Backend (`backend/.env`)

Crie este arquivo a partir de `backend/.env.example` e use valores seguros em produção.

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `4000` | Porta da API |
| `MONGODB_URI` | `mongodb://localhost:27017/fluxy` | URI do MongoDB |
| `NODE_ENV` | `development` | Ambiente |
| `JWT_SECRET` | `your-secret-key-here` | Chave secreta JWT |
| `ADMIN_EMAIL` | `your-admin@example.com` | E-mail do admin de seed |
| `ADMIN_PASSWORD` | `strong-password` | Senha do admin de seed |
| `ADMIN_NAME` | `Your Name` | Nome do admin de seed |

### Frontend (`frontend/.env.local`)

Crie este arquivo a partir de `frontend/.env.local.example`.

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL da API |

---

## Solução de Problemas

**Erro ao carregar dados no dashboard:**
1. Verifique se o MongoDB está rodando: `docker compose ps`
2. Execute o seed: `cd backend && npm run seed`
3. Verifique se o backend está ativo: `http://localhost:4000/api/health`

**Porta em uso:**
- Backend: altere `PORT` no `.env`
- Frontend: `npm run dev -- -p 3001`

**MongoDB não conecta:**
- Aguarde 10s após `docker compose up -d`
- Verifique logs: `docker compose logs mongodb`

---

## Licença

Projeto proprietário — Fluxy © 2025. Todos os direitos reservados.
