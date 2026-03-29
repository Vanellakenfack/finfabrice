# Documentation de l'API Laravel (Projet Fabrice)

Cette documentation présente les principaux points de terminaison (endpoints) de l'API disponibles sous le préfixe `/api/v1`.

## 1. Authentification (Publique)

### Inscription d'un utilisateur
- **URL** : `POST /api/v1/register`
- **Description** : Permet à un utilisateur (acheteur ou vendeur) de créer un compte.
- **Paramètres attendus (Body JSON)** :
  - `name` (string, requis) : Nom complet de l'utilisateur.
  - `email` (string, requis) : Adresse email valide et unique.
  - `phone` (string, optionnel) : Numéro de téléphone (unique).
  - `password` (string, requis) : Mot de passe (min 8 caractères, lettres et chiffres).
  - `password_confirmation` (string, requis) : Confirmation du mot de passe.
  - `role` (string, requis) : Rôle de l'utilisateur (`acheteur` ou `vendeur`).

### Connexion
- **URL** : `POST /api/v1/login`
- **Description** : Authentifie un utilisateur et retourne un token Sanctum.
- **Paramètres attendus (Body JSON)** :
  - `email` (string, requis) : Adresse email de l'utilisateur.
  - `password` (string, requis) : Mot de passe.
- **Note :** Si la 2FA (double authentification) est activée pour un vendeur/admin, le statut `202 Accepted` sera retourné avec demande de validation 2FA.

---

## 2. Catalogue (Publique)

### Liste des produits
- **URL** : `GET /api/v1/products`
- **Description** : Retourne la liste des produits disponibles (pagination/recherche éventuelle).

### Détails d'un produit
- **URL** : `GET /api/v1/products/{slug}`
- **Description** : Retourne les détails d'un produit spécifique via son identifiant textuel unique (slug).

### Liste des catégories
- **URL** : `GET /api/v1/categories`
- **Description** : Retourne la liste des catégories de produits pour filtrer le catalogue.

---

## 3. Routes Protégées (Token Sanctum Requis)

*Un token d'accès (Bearer) doit être fourni dans l'en-tête `Authorization : Bearer <token>` pour interagir avec ces routes.*

### Profil Utilisateur
- **URL** : `GET /api/v1/me`
- **Description** : Retourne les informations de l'utilisateur actuellement authentifié (nom, rôles, etc.).

### Déconnexion
- **URL** : `POST /api/v1/logout`
- **Description** : Révoque le token d'accès actuel de l'utilisateur.

### Produits (Vendeurs / Admins)
- **Créer un produit** : `POST /api/v1/products`
- **Mettre à jour un produit** : `PUT` ou `PATCH /api/v1/products/{id}`
- **Supprimer un produit** : `DELETE /api/v1/products/{id}`

### Catégories (Admins)
- **Créer une catégorie** : `POST /api/v1/categories`

### Commandes (Acheteurs)
- **Liste des commandes** : `GET /api/v1/orders` (Historique des commandes de l'utilisateur authentifié)
- **Passer une commande** : `POST /api/v1/orders`
- **Détails d'une commande** : `GET /api/v1/orders/{id}`

### Panier (Cart)
- **Consulter le panier** : `GET /api/v1/cart`
- **Ajouter un produit au panier** : `POST /api/v1/cart`
- **Supprimer un produit du panier** : `DELETE /api/v1/cart/{id}`
