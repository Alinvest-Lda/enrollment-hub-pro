# ALINVEST Courses Hub

Plataforma web da ALINVEST para divulgação de cursos, inscrições, pagamentos, comprovativos, certificados e operação administrativa.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (dados, autenticação e Edge Functions)
- WordPress/MySQL (backend M-Pesa)
- Vercel (frontend)

## Desenvolvimento local

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Validações disponíveis:

```bash
npm run lint
npm run test
npm run build
```

O repositório usa **npm** como gestor oficial e `package-lock.json` como lockfile. Não adicionar `bun.lock` ou `bun.lockb`.

## Arquitectura de produção

### Frontend

O frontend React/Vite é publicado no Vercel.

Variável necessária:

```bash
VITE_BACKEND_BASE_URL=https://seu-dominio-wordpress.com
```

O frontend usa o endpoint:

```
POST /wp-json/enrollment-hub/v1/mpesa-payment
```

O cliente inclui timeout de 30 segundos e mensagens de erro próprias para o utilizador.

### Backend M-Pesa

O plugin `wordpress/enrollment-hub-backend.php` deve estar activo no WordPress. A tabela de logs é criada com:

```sql
wordpress/schema.sql
```

Configurações do plugin:

- `enrollment_hub_mpesa_url`
- `enrollment_hub_mpesa_token`
- `enrollment_hub_service_provider_code`

O endpoint valida referência, telefone Vodacom e valor antes de contactar o M-Pesa. Respostas internas do provedor não são expostas integralmente ao navegador.

## Fluxo de inscrição

1. O participante preenche os dados.
2. Selecciona o plano de pagamento.
3. Selecciona M-Pesa ou envio de comprovativo.
4. A inscrição é criada através da Edge Function `submit-enrollment`.
5. No M-Pesa, o pedido é enviado ao backend WordPress.
6. O resultado é apresentado no fluxo de confirmação.
7. O participante pode acompanhar prestações em `/pagamentos/:enrollmentId`.

## Segurança operacional

- Nunca colocar tokens M-Pesa, chaves de serviço ou credenciais Supabase no frontend.
- Variáveis `VITE_*` são públicas no bundle; só devem conter configurações que possam ser expostas.
- Rever RLS e políticas de Storage antes de alterar tabelas ou buckets.
- O endpoint M-Pesa deve permanecer atrás de HTTPS.
- Os logs do provedor devem ser tratados como informação operacional e não como resposta pública.

## Qualidade e release

Antes de publicar uma alteração:

```bash
npm run lint
npm run test
npm run build
```

O CI deve executar estas três verificações em cada push e pull request.

## Estrutura principal

- `src/pages` — páginas públicas, pagamento e backoffice
- `src/components` — componentes da interface
- `src/hooks` — acesso a dados e estado partilhado
- `src/integrations/supabase` — cliente Supabase
- `supabase/functions` — operações server-side
- `wordpress` — backend M-Pesa e schema de logs

## Estado do projecto

O produto já possui o fluxo principal de catálogo → inscrição → pagamento → acompanhamento, além do backoffice. Alterações futuras devem privilegiar correções incrementais, testes de fluxo e consistência da arquitectura em vez de duplicar integrações.
