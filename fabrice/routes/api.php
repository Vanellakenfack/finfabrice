<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\UserController;

Route::prefix('v1')->group(function () {

    // --- ROUTES PUBLIQUES ---
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Route pour servir les images (contourne le problème de permissions Apache)
    Route::get('/images/{path}', function ($path) {
        $fullPath = storage_path('app/public/' . $path);
        if (file_exists($fullPath)) {
            return response()->file($fullPath);
        }
        abort(404);
    })->where('path', '.*');
    
    // Consultation du catalogue (Accessible sans compte)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    // --- ROUTES PROTÉGÉES (TOKEN REQUIS) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        Route::get('/me', function (Request $request) {
            return new \App\Http\Resources\Api\V1\UserResource($request->user());
        });

        Route::post('/logout', [AuthController::class, 'logout']);

        // --- ESPACE VENDEURS & ADMINS ---
        Route::middleware(['role:vendeur|admin'])->group(function () {
            // CRUD complet des produits pour les vendeurs
            Route::apiResource('products', ProductController::class)->except(['index', 'show']);
            
            // Gestion des catégories (Généralement Admin seulement)
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::get('/categories/{category}', [CategoryController::class, 'show']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
            
            // Gestion des utilisateurs (Admin seulement)
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::get('/users/{user}', [UserController::class, 'show']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });

        // --- ESPACE ACHETEURS (Ou n'importe quel connecté) ---
        Route::middleware(['role:acheteur|vendeur|admin'])->group(function () {
            // Gestion des commandes
            Route::get('/orders', [OrderController::class, 'index']);
            Route::post('/orders', [OrderController::class, 'store']);
            Route::get('/orders/{order}', [OrderController::class, 'show']);
        });

       //route paniers
  // Route::get('/cart', [CartController::class, 'index']);
  // Route::post('/cart', [CartController::class, 'store']);
  // Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    });
});