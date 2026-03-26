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

## Deploy no WordPress com CMS integrado

Este frontend pode ser publicado no WordPress (tema/plugin) usando o WordPress como fonte de conteúdo.

### 1) Configure variáveis de ambiente

Crie um arquivo `.env` com:

```sh
VITE_CMS_PROVIDER=wordpress
VITE_WORDPRESS_API_BASE=https://seu-dominio-wordpress.com

# Endpoints WP REST (opcional, altere se os CPTs tiverem outros slugs)
VITE_WP_ENDPOINT_COURSES=course
VITE_WP_ENDPOINT_TESTIMONIALS=testimonial
VITE_WP_ENDPOINT_FAQS=faq
VITE_WP_ENDPOINT_TEAM=team-member
VITE_WP_ENDPOINT_HERO_STATS=hero-stat
```

### 2) Garanta os Custom Post Types no WordPress

No WordPress, expose os CPTs no REST API (show_in_rest=true) para os slugs acima
e inclua os campos necessários (ACF/meta), por exemplo:

- `course`: `category`, `duration`, `duration_weeks`, `price`, `currency`, `start_date`, `highlights`
- `testimonial`: `name`, `role`, `course`, `text`, `rating`, `initials`, `is_active`, `display_order`
- `faq`: `question`, `answer`, `is_active`, `display_order`
- `team-member`: `name`, `role`, `bio`, `photo_url`, `is_active`, `display_order`
- `hero-stat`: `label`, `value`, `suffix`, `icon`, `is_active`, `display_order`

### 3) Build e publicação

```sh
npm install
npm run build
```

Publique o conteúdo de `dist/` no WordPress (por plugin de assets/headless ou tema custom),
mantendo as rotas SPA tratadas no servidor/rewrite.

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

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
