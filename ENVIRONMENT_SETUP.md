# Configuration des Environnements Test & Production

Ce guide explique comment configurer deux environnements Supabase distincts pour le développement/test et la production.

## 📋 Vue d'ensemble

- **Environnement TEST** : Pour le développement local et les tests
- **Environnement PROD** : Pour l'application en production (Netlify)

## 🚀 Étape 1 : Créer deux projets Supabase

### 1.1 Projet TEST

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur "New Project"
3. Nommez-le : `lifetimeline-test` (ou similaire)
4. Choisissez une région proche de vous
5. Définissez un mot de passe fort pour la base de données
6. Attendez que le projet soit créé

### 1.2 Projet PROD

1. Répétez les étapes ci-dessus
2. Nommez-le : `lifetimeline-prod`
3. **IMPORTANT** : Utilisez un mot de passe différent et sécurisé

## 🔧 Étape 2 : Configuration des variables d'environnement

### 2.1 Pour le développement local (TEST)

Créez le fichier `.env.local` à la racine du projet :

```bash
# Environment TEST - Développement Local
VITE_SUPABASE_URL=https://[votre-projet-test].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-clé-anon-test]
VITE_ENV=development
```

**Pour obtenir vos clés TEST :**

1. Allez dans votre projet `lifetimeline-test`
2. Cliquez sur l'icône ⚙️ Settings
3. Allez dans "API"
4. Copiez :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

### 2.2 Pour la production (PROD)

**Sur Netlify**, configurez les variables d'environnement :

1. Allez sur [https://app.netlify.com](https://app.netlify.com)
2. Sélectionnez votre site LifeTimeline
3. Allez dans **Site configuration** → **Environment variables**
4. Ajoutez les variables suivantes :

```
Key: VITE_SUPABASE_URL
Value: https://[votre-projet-prod].supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: [votre-clé-anon-prod]

Key: VITE_ENV
Value: production
```

**Pour obtenir vos clés PROD :**

1. Allez dans votre projet `lifetimeline-prod`
2. Cliquez sur l'icône ⚙️ Settings
3. Allez dans "API"
4. Copiez les clés comme pour TEST

## 🗄️ Étape 3 : Configurer les bases de données

### 3.1 Configuration TEST

Exécutez ce SQL dans votre projet `lifetimeline-test` :

```sql
-- 1. Créer la table users avec les champs d'onboarding
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  subscription_activated_at timestamptz,
  subscription_expires_at timestamptz,
  onboarding_completed boolean DEFAULT false,
  birthdate date,
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Activer RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 4. Fonction pour créer automatiquement le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, onboarding_completed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Tables categories et events (si pas déjà créées)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  icon text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  location text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own events"
  ON public.events FOR ALL
  USING (auth.uid() = user_id);
```

### 3.2 Configuration PROD

**Répétez exactement le même SQL** dans votre projet `lifetimeline-prod`.

## 📧 Étape 4 : Configurer l'authentification par email

Pour **chaque projet** (TEST et PROD) :

1. Allez dans **Authentication** → **Providers**
2. Activez **Email** si ce n'est pas déjà fait
3. Configurez les **Email Templates** :
   - Allez dans **Authentication** → **Email Templates**
   - Personnalisez les templates si nécessaire

### 4.1 Configuration des URLs de redirection

#### Pour TEST (développement local) :

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez dans **Redirect URLs** :
   ```
   http://localhost:5173/*
   http://localhost:5173/onboarding
   http://localhost:5173/dashboard
   ```

#### Pour PROD :

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez dans **Redirect URLs** :

   ```
   https://[votre-domaine-netlify].netlify.app/*
   https://[votre-domaine-netlify].netlify.app/onboarding
   https://[votre-domaine-netlify].netlify.app/dashboard
   ```

   (Remplacez `[votre-domaine-netlify]` par votre vrai domaine)

## 🧪 Étape 5 : Tester la configuration

### Test en local (environnement TEST)

1. Créez le fichier `.env.local` avec vos clés TEST
2. Lancez l'application :
   ```bash
   npm run dev
   ```
3. Créez un compte de test
4. Vérifiez que l'onboarding fonctionne
5. Ajoutez des événements et catégories de test

### Test en production (environnement PROD)

1. Configurez les variables d'environnement sur Netlify
2. Poussez vos changements sur GitHub :
   ```bash
   git add .
   git commit -m "feat: Configure test and production environments"
   git push
   ```
3. Netlify déploiera automatiquement avec les variables PROD
4. Testez l'inscription et l'onboarding en production

## 📂 Structure des fichiers d'environnement

```
lifetimeline/
├── .env.example          # Template (commité dans Git)
├── .env.local           # TEST - développement local (NON commité)
├── .gitignore           # Ignore tous les fichiers .env*
└── ENVIRONMENT_SETUP.md # Ce fichier (commité)
```

## ⚠️ Sécurité - À NE JAMAIS FAIRE

❌ **NE JAMAIS** commiter les fichiers `.env.local` ou `.env`
❌ **NE JAMAIS** partager vos clés API publiquement
❌ **NE JAMAIS** utiliser les clés PROD en local
❌ **NE JAMAIS** utiliser les clés TEST en production

✅ **TOUJOURS** vérifier que `.env*` est dans `.gitignore`
✅ **TOUJOURS** utiliser des mots de passe différents pour TEST et PROD
✅ **TOUJOURS** tester en local avant de déployer en prod

## 🔄 Workflow de développement recommandé

1. **Développement** : Travaillez sur la base TEST en local
2. **Tests** : Validez toutes les fonctionnalités sur TEST
3. **Commit** : Poussez le code sur GitHub
4. **Déploiement** : Netlify déploie automatiquement sur PROD
5. **Validation** : Testez rapidement en PROD

## 🆘 Dépannage

### Les variables d'environnement ne sont pas chargées

- Vérifiez que le fichier `.env.local` est à la racine du projet
- Redémarrez le serveur de développement (`npm run dev`)
- Vérifiez qu'il n'y a pas d'espaces dans les clés/valeurs

### Erreur de connexion Supabase

- Vérifiez que l'URL commence bien par `https://`
- Vérifiez que vous avez copié la bonne clé `anon public`
- Vérifiez que les tables existent dans votre base de données

### L'onboarding ne fonctionne pas

- Vérifiez que le champ `onboarding_completed` existe dans la table `users`
- Vérifiez les politiques RLS
- Regardez la console du navigateur pour les erreurs

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
