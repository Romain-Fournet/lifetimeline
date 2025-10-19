# 🎯 Configuration Onboarding - Guide Complet

## Vue d'ensemble

L'onboarding a été ajouté pour améliorer l'expérience des nouveaux utilisateurs :

1. **Signup** → **Vérification Email** → **Onboarding** → **Dashboard**
2. Collecte d'informations personnelles (âge, lieu, bio)
3. Sélection de catégories prédéfinies
4. Création optionnelle du premier souvenir

## 🗄️ Configuration Supabase

### 1. Configurer la redirection email

1. Allez dans votre projet Supabase
2. **Authentication** > **Email Templates**
3. Cliquez sur **"Confirm signup"**
4. Modifiez le template pour rediriger vers l'onboarding :

```html
<h2>Confirmez votre email</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
```

5. **Authentication** > **URL Configuration**
6. Ajoutez ces URLs dans **"Redirect URLs"** :
```
https://my-life-timeline.netlify.app/onboarding
https://my-life-timeline.netlify.app/**
```

### 2. Étendre le schéma users (optionnel)

Si vous voulez stocker les informations d'onboarding en base au lieu de dans les metadata :

```sql
-- Ajouter des colonnes au profil utilisateur
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(onboarding_completed);
```

## 🔄 Flow Utilisateur Complet

### Nouveau Compte

1. **Page Signup** (`/signup`)
   - Utilisateur remplit email, nom, mot de passe
   - Clique sur "Créer un compte"

2. **Redirection automatique** vers **Vérification Email** (`/verify-email`)
   - Message : "Vérifiez votre email"
   - Email sauvegardé dans localStorage
   - Bouton "Renvoyer l'email" disponible

3. **Email de confirmation**
   - Utilisateur reçoit email de Supabase
   - Clique sur le lien de confirmation
   - Supabase confirme le compte

4. **Redirection automatique** vers **Onboarding** (`/onboarding`)
   - Étape 1 : Profil personnel (birthdate, location, bio)
   - Étape 2 : Premier souvenir (optionnel)
   - Étape 3 : Sélection catégories (4 pré-sélectionnées)
   - Bouton "Commencer mon aventure"

5. **Redirection automatique** vers **Dashboard** (`/dashboard`)
   - Dashboard avec catégories déjà créées
   - Premier événement déjà présent (si renseigné)
   - Timeline prête à l'emploi

### Compte Existant

1. **Page Login** (`/login`)
2. **Dashboard** directement
3. Pas d'onboarding (déjà complété)

## 📋 Catégories par Défaut

Les catégories suivantes sont proposées à l'onboarding :

| Slug | Nom | Icon | Couleur | Pré-sélectionné |
|------|-----|------|---------|-----------------|
| `work` | Travail & Carrière | Briefcase | Blue | ✅ |
| `education` | Études & Formation | GraduationCap | Purple | ❌ |
| `housing` | Logement | Home | Green | ✅ |
| `travel` | Voyages | Plane | Teal | ✅ |
| `relationship` | Relations | HeartHandshake | Pink | ✅ |
| `health` | Santé & Bien-être | Activity | Red | ❌ |
| `hobbies` | Loisirs & Passions | Palette | Orange | ❌ |
| `finance` | Finances | Wallet | Emerald | ❌ |

**Minimum requis** : Au moins 1 catégorie sélectionnée

## 💾 Données Collectées

### Profil Personnel (Étape 1)

```typescript
{
  birthdate: string,        // Format: YYYY-MM-DD
  location: string,         // Ex: "Paris, France"
  bio: string              // Max 200 caractères
}
```

Stocké dans : `supabase.auth.updateUser({ data: {...} })`

### Premier Souvenir (Étape 2 - Optionnel)

```typescript
{
  title: string,           // Ex: "Mon premier jour d'école"
  date: string,           // Format: YYYY-MM-DD
  description: string     // Texte libre
}
```

Créé comme événement dans la table `events` si renseigné.

### Catégories (Étape 3)

```typescript
{
  selectedCategories: string[]  // Liste de slugs
}
```

Chaque catégorie sélectionnée est créée dans la table `categories`.

## 🎨 Design & UX

### Progress Bar
- Affichage visuel de l'avancement (1/3, 2/3, 3/3)
- Gradient bleu-teal cohérent avec le design system

### Navigation
- Bouton "Retour" à partir de l'étape 2
- Bouton "Suivant" pour avancer
- Bouton "Commencer mon aventure" à la fin
- Lien "Passer cette étape" sur l'étape 2 (premier souvenir optionnel)

### Validation
- Étape 3 : Au moins 1 catégorie requise
- Bouton désactivé si pas de catégorie sélectionnée

## 🔧 Personnalisation

### Ajouter une catégorie par défaut

Dans `src/pages/Onboarding.tsx`, ajouter à `DEFAULT_CATEGORIES` :

```typescript
{
  slug: "new-category",
  name: "Nouvelle Catégorie",
  icon: IconComponent,           // Import depuis lucide-react
  color: "bg-color-500",         // Couleur Tailwind
  description: "Description..."
}
```

### Modifier les catégories pré-sélectionnées

Dans `useState` de `Onboarding.tsx` :

```typescript
selectedCategories: ["work", "housing", "travel", "relationship"]
// Remplacer par les slugs souhaités
```

### Ajouter une étape à l'onboarding

1. Augmenter `totalSteps` dans `Onboarding.tsx`
2. Ajouter le contenu de l'étape dans le JSX
3. Ajouter la logique dans `handleComplete`

## 🐛 Troubleshooting

### Utilisateur ne reçoit pas l'email

**Solutions** :
1. Vérifier spam/promotions
2. Vérifier dans Supabase : **Auth** > **Users** > Utilisateur > **Send recovery**
3. Bouton "Renvoyer l'email" sur `/verify-email`

### Redirection ne fonctionne pas après confirmation

**Solutions** :
1. Vérifier **Authentication** > **URL Configuration** dans Supabase
2. S'assurer que l'URL de production est dans "Redirect URLs"
3. Tester avec le lien complet : `https://my-life-timeline.netlify.app/onboarding`

### Onboarding s'affiche même après complétion

**Solution** :
- Ajouter une vérification dans `ProtectedRoute.tsx` pour vérifier `onboarding_completed`
- Rediriger vers dashboard si déjà complété

### Catégories ne se créent pas

**Solutions** :
1. Vérifier RLS policies sur table `categories`
2. Vérifier la console browser (F12) pour les erreurs Supabase
3. S'assurer que l'utilisateur est bien authentifié

## ✅ Checklist Post-Déploiement

- [ ] Email de confirmation fonctionne
- [ ] Redirection vers `/verify-email` après signup
- [ ] Bouton "Renvoyer email" fonctionne
- [ ] Redirection vers `/onboarding` après confirmation
- [ ] Les 3 étapes de l'onboarding s'affichent
- [ ] Catégories se créent correctement
- [ ] Premier événement se crée (si renseigné)
- [ ] Redirection vers `/dashboard` après completion
- [ ] Dashboard affiche les catégories créées
- [ ] Timeline affiche le premier événement
- [ ] Events sans fin affichent bordure pointillée
- [ ] Events sans fin vont jusqu'à aujourd'hui

## 📊 Améliorations Futures

1. **Persistance de l'onboarding**
   - Sauvegarder la progression si l'utilisateur quitte
   - Reprendre là où il s'était arrêté

2. **Skip onboarding**
   - Permettre de sauter complètement l'onboarding
   - Créer quand même des catégories par défaut minimales

3. **Upload photo de profil**
   - Ajouter une étape pour uploader photo
   - Intégrer Supabase Storage

4. **Gamification**
   - Badges pour avoir complété l'onboarding
   - Points pour premier événement créé

5. **Analytics**
   - Tracker taux de complétion de l'onboarding
   - Identifier les étapes d'abandon

---

**Onboarding implémenté avec succès ! 🎉**

L'expérience utilisateur est maintenant fluide de l'inscription jusqu'au premier usage de l'application.
