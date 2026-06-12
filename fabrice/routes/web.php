<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\V1\AuthController;

// Route pour servir les images depuis le storage
Route::get('/storage/{path}', function ($path) {
    $path = ltrim($path, '/');
    if (str_contains($path, '..') || str_contains($path, "\0")) {
        abort(400);
    }
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath) || !is_file($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '[a-zA-Z0-9_\-\./]+');

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
|
| Ici, nous définissons les points d'entrée de la plateforme de vente en ligne.
| Conformément au CDC, nous séparons les routes publiques des routes sécurisées.
|
*/

Route::prefix('v1')->group(function () {

    // --- ROUTES PUBLIQUES ---
    // Inscription et Connexion (Ouvert à tous les futurs Acheteurs et Vendeurs)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // --- ROUTES PROTÉGÉES (TOKEN REQUIS) ---
    // Utilise Laravel Sanctum pour la sécurité [Architecture 3-tiers]
    Route::middleware('auth:sanctum')->group(function () {
        
        // Profil de l'utilisateur connecté
        Route::get('/me', function (Request $request) {
            return new \App\Http\Resources\Api\V1\UserResource($request->user());
        });

        // Déconnexion (Révocation du token)
        Route::post('/logout', [AuthController::class, 'logout']);

        // --- ESPACE VENDEURS & ADMINS ---
        // Ces routes seront protégées par les rôles Spatie (ex: gestion des stocks/produits)
        Route::middleware(['role:vendeur|admin'])->group(function () {
            // Les futurs endpoints pour la gestion des produits et Odoo iront ici
        });

        // --- ESPACE ACHETEURS ---
        Route::middleware(['role:acheteur'])->group(function () {
            // Les futurs endpoints pour les commandes et suivis iront ici
        });
    });
});