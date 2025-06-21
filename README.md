# Bianca Domingues - Gestão de Estúdio

Sistema completo para gestão de estúdio de beleza desenvolvido com Next.js, Supabase e Tailwind CSS.

## 🚀 Funcionalidades

- **Dashboard** - Visão geral do negócio com métricas principais
- **Gestão de Clientes** - CRUD completo para cadastro e gerenciamento de clientes
- **Agendamentos** - Sistema de agendamento com calendário visual e integração WhatsApp
- **Controle de Despesas** - Registro e categorização de despesas com filtros
- **Relatórios Financeiros** - Análise de desempenho com gráficos interativos
- **PWA** - Aplicativo web progressivo com notificações push
- **Responsivo** - Interface adaptada para desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Calendário**: React Big Calendar
- **Ícones**: Lucide React
- **Estado**: Zustand
- **PWA**: Service Worker, Web App Manifest

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd bianca-domingues-studio
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização e configure o projeto
5. Aguarde a criação do banco de dados

#### 3.2. Execute o script SQL
1. No painel do Supabase, vá para "SQL Editor"
2. Execute o script SQL fornecido (`supabase_schema.sql`)

#### 3.3. Configure as variáveis de ambiente
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. No painel do Supabase, vá para Settings > API
3. Copie a "Project URL" e "anon public" key
4. Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🚀 Deploy na Vercel

### 1. Preparação
1. Faça commit de todas as alterações
2. Envie o código para um repositório Git (GitHub, GitLab, etc.)

### 2. Deploy automático
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta Git
3. Importe o repositório do projeto
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em "Deploy"

### 3. Configuração de domínio (opcional)
1. No painel da Vercel, vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

## 📱 Instalação como PWA

### No Desktop (Chrome/Edge)
1. Acesse a aplicação no navegador
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### No Mobile
1. Acesse a aplicação no navegador
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

## 🔔 Configuração de Notificações

1. Clique no ícone de sino no canto superior direito
2. Clique em "Ativar Notificações"
3. Permita as notificações quando solicitado pelo navegador
4. As notificações de lembrete serão enviadas automaticamente

## 📊 Estrutura do Banco de Dados

### Tabelas principais:
- `clients` - Dados dos clientes
- `procedures` - Procedimentos oferecidos
- `appointments` - Agendamentos
- `appointment_procedures` - Relação agendamentos-procedimentos
- `expenses` - Despesas da empresa

### Relacionamentos:
- Um cliente pode ter vários agendamentos
- Um agendamento pode ter vários procedimentos
- Despesas são categorizadas por tipo

## 🎨 Personalização

### Cores do tema
As cores principais estão definidas no Tailwind CSS:
- Rosa principal: `#ec4899`
- Cores secundárias: definidas em `tailwind.config.js`

### Categorias de despesas
Edite o array `EXPENSE_CATEGORIES` em `/src/app/despesas/page.tsx`

### Procedimentos
Adicione novos procedimentos diretamente no banco de dados via Supabase

## 🐛 Solução de Problemas

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se o script SQL foi executado corretamente

### Notificações não funcionam
- Verifique se o navegador suporta notificações
- Confirme se as permissões foram concedidas
- Teste em modo HTTPS (necessário para PWA)

### Problemas de build
- Execute `npm run build` localmente para verificar erros
- Verifique se todas as dependências estão instaladas
- Confirme se as variáveis de ambiente estão configuradas

## 📝 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Gera build de produção
npm run start        # Executa build de produção
npm run lint         # Executa linter
npm run type-check   # Verifica tipos TypeScript
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no repositório
- Entre em contato via email

---

Desenvolvido com ❤️ para gestão eficiente de estúdios de beleza.

