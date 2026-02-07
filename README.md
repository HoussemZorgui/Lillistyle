# Lillistyle - E-commerce Élégant

Plateforme e-commerce haut de gamme spécialisée dans la mode pour Femme, Homme et Enfant.

## 🚀 Déploiement Cloud (Vercel + Supabase)

Le projet est configuré pour être déployé gratuitement sur Vercel avec une base de données Supabase.

### Variables d'environnement requises sur Vercel :

| Variable | Source |
| --- | --- |
| `DATABASE_URL` | Copiez la valeur depuis votre fichier `.env` local |
| `JWT_SECRET` | Une phrase secrète au choix (ex: `LillistyleUltraSecret2026!`) |
| `NEXT_PUBLIC_APP_URL` | L'URL fournie par Vercel après le premier déploiement |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Copiez la valeur depuis votre fichier `.env` local |
| `SMTP_PASS` | Copiez la valeur depuis votre fichier `.env` local |
| `SMTP_FROM` | `Lillistyle <votre-email@gmail.com>` |

### Étapes Finales :
1. Connectez votre GitHub à [Vercel](https://vercel.com).
2. Importez le projet `Lillistyle`.
3. Ajoutez les variables ci-dessus.
4. Dans l'onglet **Build & Development Settings**, assurez-vous que la commande de build est : `npx prisma generate && next build`.

## 🛠 Installation Locale
1. `npm install`
2. `npx prisma generate`
3. `npm run dev`
