# 🎓 BIACCOSystem - Gestão de Arquivos Acadêmicos

<div align="left">
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="Typescript"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="Javascript"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Nodejs"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL"/>
</div>

## 📌 Sobre o Projeto
O **BIACCOSystem** é uma plataforma desenvolvida para otimizar o compartilhamento de materiais de estudo entre professores e alunos dos cursos de **IA** e **CCO**. Ele centraliza uploads, organização por módulos e acesso rápido aos arquivos.

### Pré-requisitos

- Node.js 18+
- MySQL 8.0+ (Local ou Cloud)
- PNPM (Instalar via `npm i -g pnpm`)

---

## ⚙️ Configuração do Banco de Dados

### 1. Criar o Schema (Necessário um Banco de Dados MySQL)

No seu MySQL, execute o script SQL (shema.sql) localizado na pasta de scripts para criar a estrutura de tabelas:

```sql
├── scripts/             # Scripts de automação
│   ├── migrar.ts        # Script de migração do banco
│   └── schema.sql       # Definição das tabelas SQL
```
2. Configurar Variáveis de Ambiente
Crie um arquivo chamado .env na raiz do projeto (este arquivo é ignorado pelo Git para sua segurança):

```bash
# Conexão MySQL
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=sua_senha
MYSQLDATABASE=forum_academico
```
🚀 Como Iniciar o Sistema
1. Instalar dependências
Utilize o pnpm para garantir que as versões das dependências estejam sincronizadas:

```bash
pnpm install
```
2. Rodar Migrações (Se necessário)

```bash
pnpm ts-node scripts/migrar.ts
4. Iniciar o Servidor de Desenvolvimento
```
3. Rodar o Projeto

```bash
pnpm dev
```
Acesse a aplicação em: http://localhost:3000

## 📁 Estrutura do Projeto
```text
BIACCOSystem/
├── app/                 # Core do Next.js (App Router)
│   ├── (auth)/          # Rotas de autenticação (Login/Registro)
│   ├── (main)/          # Rotas principais da aplicação
│   ├── api/             # Endpoints da API (Backend)
│   ├── uploads/         # Lógica de manipulação de arquivos
│   ├── globals.css      # Estilos globais
│   └── layout.tsx       # Layout principal da aplicação
├── components/          # Componentes React reutilizáveis
│   ├── ui/              # Componentes de interface (Shadcn/UI, etc)
│   └── header.tsx       # Cabeçalho global
├── hooks/               # Hooks customizados para lógica de estado
├── lib/                 # Utilitários e conexão com Banco de Dados
├── public/              # Arquivos estáticos (Imagens, SVGs)
├── scripts/             # Scripts de automação
│   ├── migrar.ts        # Script de migração do banco
│   └── schema.sql       # Definição das tabelas SQL
├── styles/              # Configurações extras de estilização
├── .env                 # Variáveis de ambiente (IGNORADO NO GIT)
└── .gitignore           # Arquivos e pastas ignorados pelo controle de versão
```
Desenvolvido por Wanderson Dias (Diaz Dev)
