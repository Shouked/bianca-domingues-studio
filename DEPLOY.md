# Guia de Deploy na Vercel

Este guia fornece instruções passo a passo para fazer o deploy da aplicação Bianca Domingues - Gestão de Estúdio na Vercel.

## 📋 Pré-requisitos

- [ ] Projeto Supabase configurado e funcionando
- [ ] Código fonte em repositório Git (GitHub, GitLab, Bitbucket)
- [ ] Conta na Vercel
- [ ] Variáveis de ambiente do Supabase

## 🚀 Passo a Passo

### 1. Preparação do Repositório

```bash
# Certifique-se de que todas as alterações estão commitadas
git add .
git commit -m "Preparação para deploy"
git push origin main
```

### 2. Configuração na Vercel

1. **Acesse a Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login ou crie uma conta

2. **Importe o Projeto**
   - Clique em "New Project"
   - Conecte sua conta Git (GitHub/GitLab/Bitbucket)
   - Selecione o repositório do projeto
   - Clique em "Import"

3. **Configuração do Projeto**
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install` (padrão)

### 3. Configuração de Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter as variáveis do Supabase:**
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para Settings > API
3. Copie a "Project URL" e "anon public" key

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (2-5 minutos)
3. Acesse a URL fornecida para testar

### 5. Configuração de Domínio Personalizado (Opcional)

1. **No painel da Vercel:**
   - Vá para Settings > Domains
   - Clique em "Add Domain"
   - Digite seu domínio

2. **Configure o DNS:**
   - Adicione um registro CNAME apontando para `cname.vercel-dns.com`
   - Ou configure os nameservers da Vercel

### 6. Configurações Avançadas

#### 6.1. Configuração de Headers de Segurança
O arquivo `vercel.json` já inclui headers de segurança:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

#### 6.2. Cache do Service Worker
Configuração especial para PWA no `vercel.json`:
- Service Worker sem cache
- Manifest com cache longo

#### 6.3. Região de Deploy
Configurado para `gru1` (São Paulo) para melhor performance no Brasil.

## 🔧 Configurações Específicas

### Arquivo vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  }
}
```

### Variáveis de Ambiente Obrigatórias
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública do Supabase

### Variáveis Opcionais
- `NEXT_PUBLIC_APP_URL`: URL da aplicação (para PWA)

## 🧪 Teste do Deploy

### 1. Funcionalidades Básicas
- [ ] Dashboard carrega corretamente
- [ ] Navegação entre páginas funciona
- [ ] Dados mock são exibidos

### 2. PWA
- [ ] Manifest.json acessível
- [ ] Service Worker registra
- [ ] Instalação como app funciona

### 3. Responsividade
- [ ] Layout mobile funciona
- [ ] Sidebar responsiva
- [ ] Gráficos se adaptam

### 4. Performance
- [ ] Lighthouse Score > 90
- [ ] Carregamento < 3 segundos
- [ ] Core Web Vitals verdes

## 🐛 Solução de Problemas

### Build Falha
```bash
# Teste o build localmente
npm run build

# Verifique erros de TypeScript
npm run type-check

# Verifique linting
npm run lint
```

### Variáveis de Ambiente
- Verifique se estão configuradas na Vercel
- Confirme se os valores estão corretos
- Teste localmente com as mesmas variáveis

### Service Worker
- Verifique se `sw.js` está na pasta `public`
- Confirme headers no `vercel.json`
- Teste em HTTPS (obrigatório para PWA)

### Supabase Connection
- Verifique se o projeto Supabase está ativo
- Confirme se as tabelas foram criadas
- Teste a conexão localmente

## 📊 Monitoramento

### Analytics da Vercel
- Acesse Analytics no painel da Vercel
- Monitore Core Web Vitals
- Acompanhe tempo de carregamento

### Logs de Erro
- Verifique Functions logs
- Monitore erros de runtime
- Configure alertas se necessário

## 🔄 Atualizações

### Deploy Automático
- Pushes para `main` fazem deploy automático
- Preview deployments para outras branches
- Rollback disponível no painel

### Deploy Manual
```bash
# Usando Vercel CLI
npm i -g vercel
vercel --prod
```

## 📞 Suporte

### Recursos Úteis
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)

### Problemas Comuns
- [Troubleshooting Vercel](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)
- [Next.js Deploy Issues](https://nextjs.org/docs/deployment#vercel)

---

✅ **Deploy concluído com sucesso!**

Sua aplicação estará disponível em: `https://seu-projeto.vercel.app`

