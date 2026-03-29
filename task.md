# Intégration Frontend-Backend (Next.js - Laravel Sanctum)

## Phase 1 : Configuration initiale
- [ ] Installer Axios pour la gestion des requêtes HTTP (recommandé avec Sanctum pour la gestion du CSRF).
- [ ] Créer les variables d'environnement dans le frontend (`.env.local`) pointant vers l'API (`http://localhost:8000`).
- [ ] Configurer CORS et les domaines stateful dans le backend Laravel (`config/cors.php` et `config/sanctum.php`).

## Phase 2 : Client HTTP et Services
- [ ] Créer une instance Axios configurée (`lib/axios.ts` ou `services/api.ts`) avec `withCredentials: true` et l'intercepteur pour gérer les erreurs (ex: 401).
- [ ] Mettre en place la récupération du cookie CSRF (`GET /sanctum/csrf-cookie`).
- [ ] Créer le service d'authentification (`services/authService.ts`) avec les fonctions : [login](file:///c:/Users/vanella/Desktop/Nouveau%20dossier/fabrice/app/Http/Controllers/Api/V1/AuthController.php#41-70), [register](file:///c:/Users/vanella/Desktop/Nouveau%20dossier/fabrice/app/Http/Controllers/Api/V1/AuthController.php#16-40), [logout](file:///c:/Users/vanella/Desktop/Nouveau%20dossier/fabrice/app/Http/Controllers/Api/V1/AuthController.php#71-80).

## Phase 3 : Gestion de l'état global (Redux)
- [ ] Créer / Mettre à jour le slice Redux de l'utilisateur (`store/slices/authSlice.ts`) pour stocker l'utilisateur connecté et son token d'accès.
- [ ] Gérer l'hydratation de l'utilisateur au démarrage de l'application (récupération de `/api/v1/me`).

## Phase 4 : Intégration dans les interfaces
- [ ] Connecter le formulaire d'inscription (Register) à l'API.
- [ ] Connecter le formulaire de connexion (Login) à l'API.
- [ ] Mettre en place un système de routes protégées côté React/Next.js (rediriger vers `/login` si non authentifié).
