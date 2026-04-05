# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Package manager policy

This repository is standardized on **npm**.

- Use `package-lock.json` as the single lockfile source of truth.
- Do not commit `bun.lock` or `bun.lockb`.
- Run all project scripts with npm (`npm run lint`, `npm run test`, `npm run build`).

### npm registry troubleshooting

If dependency installation fails due proxy/registry configuration, force npm to use the public registry:

```sh
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

### Nova arquitetura de deploy (Frontend Vercel + Backend WordPress/MySQL)

- **Frontend (React/Vite):** deploy no Vercel.
- **Backend API:** plugin WordPress em `wordpress/enrollment-hub-backend.php`.
- **Base de dados:** MySQL do WordPress.

#### Variáveis do frontend (Vercel)

Defina:

```bash
VITE_BACKEND_BASE_URL=https://seu-dominio-wordpress.com
```

O frontend chama:

`POST /wp-json/enrollment-hub/v1/mpesa-payment`

#### Backend WordPress

1. Instalar o plugin `wordpress/enrollment-hub-backend.php`.
2. Criar a tabela de logs com `wordpress/schema.sql`.
3. Configurar opções no WordPress:
   - `enrollment_hub_mpesa_url`
   - `enrollment_hub_mpesa_token`
   - `enrollment_hub_service_provider_code`

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
