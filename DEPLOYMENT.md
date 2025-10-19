# Guide de Déploiement - LifeTimeline

## ✅ Pré-requis

Avant de déployer en production, assurez-vous que :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] La base de données Supabase est configurée avec les tables nécessaires
- [ ] Les Row Level Security (RLS) policies sont activées sur Supabase
- [ ] Le build de production fonctionne localement (`npm run build`)
- [ ] Tous les tests sont passants

## 🗄️ Configuration Supabase

### 1. Créer les tables

```sql
-- Table users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_activated_at TIMESTAMP WITH TIME ZONE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  icon TEXT,
  color TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  photos TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_display_order ON categories(display_order);
```

### 2. Configurer Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- Policies pour categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour events
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Trigger pour updated_at

```sql
-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur chaque table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Fonction pour créer un profil automatiquement

```sql
-- Créer un profil user automatiquement après signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🌐 Déploiement sur Vercel

### 1. Préparation

```bash
# Installer Vercel CLI (optionnel)
npm i -g vercel

# Build local pour tester
npm run build
npm run preview
```

### 2. Configuration Vercel

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement :
   - `VITE_SUPABASE_URL` : URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

3. Build settings :
   - Framework Preset : `Vite`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Install Command : `npm install`

### 3. Déploiement

```bash
# Via CLI
vercel

# Ou push sur main/master pour déploiement automatique
git push origin main
```

## 🚀 Déploiement sur Netlify

### 1. Fichier netlify.toml

Créer `netlify.toml` à la racine :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### 2. Configuration

1. Connecter le repository sur Netlify
2. Ajouter les variables d'environnement dans Settings > Environment
3. Déployer

## 📊 Checklist pré-production

### Sécurité
- [ ] Variables d'environnement configurées (pas de clés en dur)
- [ ] RLS activé sur toutes les tables Supabase
- [ ] HTTPS forcé sur le domaine
- [ ] Headers de sécurité configurés

### Performance
- [ ] Build optimisé (`npm run build` sans erreurs)
- [ ] Images optimisées
- [ ] Lazy loading des routes si nécessaire
- [ ] Cache configuré

### UX/Fonctionnalités
- [ ] Tous les états de chargement implémentés
- [ ] Messages d'erreur clairs
- [ ] Design responsive testé
- [ ] Navigation fonctionnelle
- [ ] Formulaires avec validation

### Tests
- [ ] Test de bout en bout des parcours utilisateur :
  - [ ] Inscription → Connexion → Dashboard
  - [ ] Création de catégories
  - [ ] Création d'événements
  - [ ] Timeline avec zoom
  - [ ] Upgrade Premium
  - [ ] Modification profil
  - [ ] Suppression compte
- [ ] Test sur mobile/tablette/desktop
- [ ] Test sur différents navigateurs

### Monitoring
- [ ] Erreurs frontend trackées (Sentry recommandé)
- [ ] Analytics configurés (Google Analytics, Plausible, etc.)
- [ ] Monitoring Supabase activé

## 🐛 Bugs connus corrigés

✅ Timeline crash avec 0 événements - CORRIGÉ
✅ Suppression de compte nécessitant admin API - CORRIGÉ
✅ Codes Premium 2024 non acceptés - CORRIGÉ
✅ Banners non fermables - CORRIGÉ
✅ Positionnement imprécis des événements - CORRIGÉ
✅ Couleurs catégories non appliquées - CORRIGÉ

## 📝 Notes importantes

1. **Codes Premium** : Les codes actuels sont en dur dans le code. Pour la production, implémentez un système de vérification côté serveur.

2. **Suppression de compte** : La fonction actuelle supprime les données mais ne peut pas supprimer le compte auth. Considérez une edge function Supabase pour cela.

3. **Photos** : Actuellement stockées comme URLs. Pour la production, intégrez Supabase Storage.

4. **Emails** : Configurer les templates d'emails Supabase pour confirmation, reset password, etc.

## 🆘 Support et dépannage

### Erreur : "Missing Supabase environment variables"
→ Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien configurées

### Erreur : "Row Level Security policy violation"
→ Vérifier que les policies RLS sont correctement configurées sur Supabase

### Timeline ne s'affiche pas
→ Vérifier la console pour les erreurs, s'assurer que les événements ont des dates valides

### Build échoue
→ Lancer `npm run lint` pour identifier les erreurs TypeScript/ESLint

## 📞 Contact

Pour toute question sur le déploiement, contactez l'équipe technique.
