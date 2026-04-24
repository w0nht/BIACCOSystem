# 🎓 BIACCOSystem - Gestão de Arquivos Acadêmicos

<div align="left">
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python"/>
  <img height="40" src="https://cdn.iconscout.com/icon/free/png-512/c-programming-569564.png" alt="C++"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="Typescript"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="Javascript"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Nodejs"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL"/>
  <img height="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/supabase/supabase-original.svg" alt="Supabase"/>
</div>

## 📌 Sobre o Projeto
O **BIACCOSystem** é uma plataforma desenvolvida para otimizar o compartilhamento de materiais de estudo entre professores e alunos dos cursos de **IA** e **CCO**. Ele centraliza uploads, organização por módulos e acesso rápido aos arquivos.

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
