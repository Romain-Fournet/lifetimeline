# 🚀 Guide de Déploiement Netlify - LifeTimeline

## Étape 1 : Préparation du Repository

### 1.1 Vérifier que tout est commité

```bash
git status
# Devrait afficher : working tree clean
```

### 1.2 Pousser vers GitHub (si pas déjà fait)

```bash
# Si le repository n'existe pas encore sur GitHub
# Créer un nouveau repo sur github.com puis :

git remote add origin https://github.com/VOTRE-USERNAME/lifetimeline.git
git branch -M main
git push -u origin main
```

## Étape 2 : Configuration Supabase

### 2.1 Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur "New Project"
3. Choisir un nom : `lifetimeline-prod`
4. Choisir une région proche de vos utilisateurs (eu-west-1 pour Europe)
5. Générer un mot de passe fort
6. Attendre la création du projet (~2 minutes)

### 2.2 Récupérer les clés d'API

1. Dans le dashboard Supabase, aller dans **Settings** > **API**
2. Copier :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : `eyJhbGci...`

### 2.3 Exécuter les scripts SQL

1. Dans Supabase, aller dans **SQL Editor**
2. Créer une nouvelle query
3. Copier-coller le contenu de `DEPLOYMENT.md` section "Configuration Supabase"
4. Exécuter dans cet ordre :

   - ✅ Création des tables
   - ✅ Row Level Security policies
   - ✅ Triggers updated_at
   - ✅ Fonction handle_new_user

5. Vérifier dans **Table Editor** que les 3 tables sont créées :
   - ✅ users
   - ✅ categories
   - ✅ events

## Étape 3 : Déploiement sur Netlify

### 3.1 Créer un compte Netlify

1. Aller sur [netlify.com](https://netlify.com)
2. Cliquer sur "Sign up"
3. Utiliser "Sign up with GitHub" (recommandé)
4. Autoriser Netlify à accéder à vos repositories

### 3.2 Importer le projet

1. Dans Netlify dashboard, cliquer sur **"Add new site"** > **"Import an existing project"**
2. Choisir **"Deploy with GitHub"**
3. Autoriser Netlify si demandé
4. Chercher et sélectionner le repository `lifetimeline`
5. Netlify va détecter automatiquement :
   - ✅ Framework : Vite
   - ✅ Build command : `npm run build` (depuis netlify.toml)
   - ✅ Publish directory : `dist` (depuis netlify.toml)

### 3.3 Configurer les variables d'environnement

**AVANT de déployer**, ajouter les variables d'environnement :

1. Dans la configuration du site, section **"Environment variables"**
2. Cliquer sur **"Add a variable"**
3. Ajouter les 2 variables suivantes :

```
Nom : VITE_SUPABASE_URL
(coller l'URL de votre projet Supabase)

Nom : VITE_SUPABASE_ANON_KEY
(coller la clé anon de votre projet Supabase)
```

4. **Important** : Marquer les variables comme "Available on deploy previews" ET "Available on production"

### 3.4 Déployer !

1. Cliquer sur **"Deploy lifetimeline"**
2. Netlify va :

   - ✅ Cloner votre repository
   - ✅ Installer les dépendances (`npm install`)
   - ✅ Lancer le build (`npm run build`)
   - ✅ Publier le dossier `dist`
   - ⏱️ Temps estimé : 2-3 minutes

3. Suivre le déploiement dans l'onglet **"Deploys"**

### 3.5 Vérification du déploiement

Une fois terminé, vous verrez :

- ✅ **Status** : Published
- 🌐 **URL** : `https://random-name-123.netlify.app`

Cliquer sur l'URL pour tester !

## Étape 4 : Configuration Post-Déploiement

### 4.1 Configurer Supabase pour Netlify

1. Dans Supabase, aller dans **Authentication** > **URL Configuration**
2. Ajouter l'URL Netlify dans **Site URL** :
   ```
   https://votre-site.netlify.app
   ```
3. Ajouter dans **Redirect URLs** :
   ```
   https://votre-site.netlify.app/
   https://votre-site.netlify.app/**
   ```

### 4.2 Personnaliser le nom de domaine (optionnel)

1. Dans Netlify, aller dans **Site settings** > **Domain management**
2. Cliquer sur **"Change site name"**
3. Choisir un nom : `lifetimeline-app` → `https://lifetimeline-app.netlify.app`

Ou ajouter un domaine personnalisé :

1. Cliquer sur **"Add custom domain"**
2. Entrer votre domaine : `lifetimeline.com`
3. Suivre les instructions DNS

### 4.3 Activer HTTPS

Netlify active automatiquement HTTPS avec Let's Encrypt.
Vérifier dans **Site settings** > **Domain management** > **HTTPS** :

- ✅ Certificate should say "Netlify's Certificate"
- ✅ Force HTTPS enabled

## Étape 5 : Tests Finaux

### 5.1 Checklist de tests

Sur `https://votre-site.netlify.app`, tester :

- [ ] **Landing page** s'affiche correctement
- [ ] **Signup** : Créer un nouveau compte
  - Email de confirmation reçu ?
  - Redirection vers dashboard OK ?
- [ ] **Dashboard** vide s'affiche (nouveau compte)
- [ ] **Créer une catégorie**
  - Modal s'ouvre ?
  - Catégorie créée avec succès ?
- [ ] **Créer un événement**
  - Formulaire fonctionne ?
  - Événement visible sur timeline ?
- [ ] **Timeline**
  - Affichage correct ?
  - Zoom fonctionne ?
  - Événement bien positionné ?
- [ ] **Upgrade Premium**
  - Code PREMIUM2024 accepté ?
  - Message de succès ?
  - Limites retirées ?
- [ ] **Settings**
  - Modifier profil OK ?
  - Changer mot de passe OK ?
- [ ] **Mobile**
  - Tester sur téléphone
  - Responsive OK ?

### 5.2 Vérifier la console

Ouvrir la console développeur (F12) :

- ❌ Pas d'erreurs rouges
- ⚠️ Warnings mineurs OK
- ✅ Requêtes Supabase réussies (200)

## Étape 6 : Déploiement Continu

### Workflow automatique

Maintenant, **chaque push sur `main`** déclenchera un déploiement automatique :

```bash
# Faire des changements
git add .
git commit -m "fix: correction bug"
git push origin main

# Netlify va automatiquement :
# 1. Détecter le push
# 2. Lancer un nouveau build
# 3. Déployer si le build réussit
```

### Branch deploys (optionnel)

Netlify peut déployer chaque branche :

1. **Site settings** > **Build & deploy** > **Deploy contexts**
2. Activer **"Deploy previews"**
3. Chaque PR aura sa propre URL de preview !

## 🐛 Troubleshooting

### Erreur : Build failed

**Vérifier dans les logs Netlify** :

1. Aller dans **Deploys** > Cliquer sur le deploy échoué
2. Lire les logs

**Solutions communes** :

- ❌ `Missing environment variables` → Vérifier les variables VITE\_\*
- ❌ `TypeScript errors` → Lancer `npm run build` localement
- ❌ `Module not found` → Vérifier les imports

### Erreur : Page blanche après déploiement

**Console navigateur affiche** :

```
Failed to load module script
```

**Solution** :

- Vérifier que `base` est correct dans `vite.config.ts`
- Devrait être : `base: '/'`

### Erreur : "Missing Supabase environment variables"

**Les variables ne sont pas chargées**

**Solutions** :

1. Vérifier dans Netlify **Site settings** > **Environment variables**
2. Les noms doivent être EXACTEMENT :
   - `VITE_SUPABASE_URL` (pas `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (pas `SUPABASE_ANON_KEY`)
3. Redéployer : **Deploys** > **Trigger deploy** > **Clear cache and deploy**

### Erreur : Redirect loop sur /login

**Supabase redirect URLs non configurées**

**Solution** :

1. Supabase > **Authentication** > **URL Configuration**
2. Ajouter URL Netlify dans **Redirect URLs**

### Erreur : Email de confirmation non reçu

**Emails Supabase non configurés**

**Solutions** :

1. Vérifier spam/promotions
2. Dans Supabase : **Authentication** > **Email Templates**
3. Activer **"Confirm signup"**
4. En développement : Vérifier dans Supabase > **Auth** > **Users** (lien de confirmation)

## 📊 Monitoring

### Netlify Analytics (optionnel, payant)

1. **Analytics** > **Enable analytics**
2. Voir :
   - Visiteurs uniques
   - Pages vues
   - Top pages
   - Bandwidth

### Logs en temps réel

1. **Deploys** > Cliquer sur deploy actif
2. **Functions log** (si edge functions)
3. Voir les erreurs en production

### Notifications

1. **Site settings** > **Build & deploy** > **Deploy notifications**
2. Ajouter :
   - Email si deploy échoue
   - Slack notification (optionnel)
   - Webhook (optionnel)

## ✅ Checklist Finale

- [ ] Repository GitHub créé et à jour
- [ ] Projet Supabase créé
- [ ] Tables SQL créées avec RLS
- [ ] Trigger handle_new_user activé
- [ ] Site Netlify créé et lié au repo
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi (vert ✅)
- [ ] URL Netlify ajoutée dans Supabase
- [ ] Tests signup/login/dashboard OK
- [ ] Tests création catégories/événements OK
- [ ] Tests timeline avec zoom OK
- [ ] Tests responsive mobile OK
- [ ] Console sans erreurs rouges
- [ ] Domaine personnalisé configuré (optionnel)

## 🎉 Félicitations !

Votre application **LifeTimeline** est maintenant en production sur Netlify !

URL de production : `https://votre-site.netlify.app`

### Prochaines étapes recommandées

1. **Analytics** : Installer Google Analytics ou Plausible
2. **Sentry** : Monitorer les erreurs JavaScript
3. **Uptime** : Utiliser UptimeRobot pour surveiller la disponibilité
4. **Backups** : Configurer backup automatique Supabase

---

**Besoin d'aide ?**

- Documentation Netlify : https://docs.netlify.com
- Documentation Supabase : https://supabase.com/docs
- Support : Ouvrir un ticket sur le repository GitHub
