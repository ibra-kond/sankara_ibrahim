# Guide de déploiement pas à pas

Durée : environ 30 minutes. Tout est gratuit (offres gratuites de Supabase et Netlify ou Vercel).

---

## Étape 0 — Personnaliser le site

1. Ouvrez `src/config.js` et remplissez au minimum :
   - `siteUrl` : l'adresse finale du site (vous pourrez la corriger après l'étape 3)
   - `businessName`, `ownerFirstName`, `ownerLastName`, `city`, `country`
   - `whatsapp` : indicatif + numéro, **sans + ni espaces** (ex. `22670123456`)
   - `facebook`, `tiktok`, `currency`
2. Regénérez les icônes et l'image de partage avec le nouveau nom :
   ```bash
   npm install
   npm run assets
   ```
3. Testez en local :
   ```bash
   npm run dev
   ```
   Ouvrez http://localhost:5173. Sans Supabase, le site tourne en **mode démo** :
   l'admin (`/admin`) fonctionne avec `admin@demo.fr` / `demo1234`, et les changements restent dans votre navigateur.

> Ces valeurs servent aussi au référencement (titre Google, aperçu WhatsApp/Facebook, données Schema.org).
> Le menuisier pourra ensuite les modifier depuis l'admin, sauf le référencement, qui est figé au moment du déploiement.

---

## Étape 1 — Créer la base Supabase

1. Créez un compte sur https://supabase.com, puis **New project**.
   - Région : la plus proche de vos clients (ex. *West EU (Paris)* pour l'Afrique de l'Ouest).
   - Notez le mot de passe de la base dans un endroit sûr.
2. Menu **SQL Editor** > **New query** : collez tout le contenu de `supabase/schema.sql`, puis **Run**.
3. (Facultatif) Nouvelle requête : collez `supabase/seed.sql`, puis **Run**. Le site affichera les données de démonstration.
4. Créez le compte du menuisier :
   - **Authentication** > **Users** > **Add user** > *Create new user*
   - Email + mot de passe, cochez **Auto Confirm User**.
5. Autorisez ce compte à modifier le site. Dans le **SQL Editor** :
   ```sql
   insert into public.admins (email) values ('email-du-menuisier@exemple.com');
   ```
6. **Bloquez les inscriptions publiques** :
   **Authentication** > **Sign In / Providers** > **Email** : désactivez *Allow new users to sign up*.
7. Récupérez vos clés : **Project Settings** > **API**
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

> La clé `anon` peut être publique : ce sont les règles de sécurité (RLS) du fichier SQL qui protègent l'écriture.
> Ne mettez **jamais** la clé `service_role` dans le site.

Pour tester en local avec Supabase : copiez `.env.example` en `.env`, collez les deux valeurs, puis relancez `npm run dev`.

---

## Étape 2 — Mettre le code sur GitHub

```bash
git init
git add .
git commit -m "Portfolio menuisier"
```
Créez un dépôt sur https://github.com/new, puis suivez les instructions « push an existing repository ».
Le fichier `.env` est ignoré par Git : vos clés ne partent pas sur GitHub.

---

## Étape 3a — Déployer sur Netlify (recommandé)

1. https://app.netlify.com > **Add new site** > **Import an existing project** > GitHub > votre dépôt.
2. Les réglages sont lus depuis `netlify.toml` (commande `npm run build`, dossier `dist`).
3. **Site configuration** > **Environment variables** : ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. **Deploys** > **Trigger deploy**.
5. Notez l'adresse obtenue (ex. `https://atelier-du-bois.netlify.app`), mettez-la dans `siteUrl` de `src/config.js`, puis faites un commit et un push : le site se redéploie tout seul.

## Étape 3b — ou déployer sur Vercel

1. https://vercel.com/new > importez le dépôt. Vercel détecte Vite tout seul.
2. Ajoutez les deux variables d'environnement, puis **Deploy**.
3. Le fichier `vercel.json` gère déjà les adresses (`/realisations/...`, `/admin`) et le cache.

---

## Étape 4 — Nom de domaine (facultatif)

Netlify : **Domain management** > **Add a domain**. Vercel : **Settings** > **Domains**.
Après le changement, mettez à jour `siteUrl` dans `src/config.js` et redéployez.

---

## Étape 5 — Vérifications

- [ ] Le bouton WhatsApp ouvre la bonne conversation, avec le message pré-rempli.
- [ ] `/admin` : connexion OK. Ajouter une création avec photo : elle apparaît sur le site.
- [ ] Partager le lien sur WhatsApp : l'aperçu montre l'image et le titre. Pour forcer Facebook à recharger l'aperçu : https://developers.facebook.com/tools/debug/
- [ ] Sur Android/Chrome : la bannière « Installer l'application » apparaît après quelques secondes.
- [ ] Chrome DevTools > **Lighthouse** (mode mobile) : objectif ≥ 90 partout.
- [ ] Google Search Console : ajoutez le site et soumettez `https://votre-site/sitemap.xml`.

---

## Mises à jour

- Après une modification de `public/sw.js`, augmentez `VERSION` en haut du fichier pour que les téléphones prennent la nouvelle version.
- Les contenus (créations, prix, textes) se gèrent depuis `/admin` : aucun redéploiement n'est nécessaire.

## Limites de l'offre gratuite Supabase

- 500 Mo de base de données et 1 Go de stockage de photos : des milliers de photos compressées (environ 200 Ko chacune).
- Un projet sans aucune activité pendant 7 jours est mis en pause. Il suffit de le relancer depuis le tableau de bord Supabase.
  Un site visité régulièrement n'est pas concerné.
