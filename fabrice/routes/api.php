<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\VendorController;
use App\Http\Controllers\Api\V1\ChatController;

Route::prefix('v1')->group(function () {

    // --- ROUTES PUBLIQUES ---
    Route::middleware('throttle:10,1')->post('/register', [AuthController::class, 'register']);
    Route::middleware('throttle:5,1')->post('/login', [AuthController::class, 'login']);

    // --- CHAT (public) ---
    Route::post('/chat/start', [ChatController::class, 'startConversation']);
    Route::post('/chat/find-by-email', [ChatController::class, 'findByEmail']);
    Route::get('/chat/{token}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/{token}/messages', [ChatController::class, 'sendMessage']);

    // Route pour servir les images
    Route::get('/images/{path}', function ($path) {
        // Protection contre la traversée de répertoire
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
            Route::patch('/products/{product}/toggle', [ProductController::class, 'toggleActive']);
            Route::get('/admin/products', [ProductController::class, 'adminIndex']);

            // Gestion des catégories
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::get('/categories/{category}', [CategoryController::class, 'show']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // Gestion des utilisateurs
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::get('/users/{user}', [UserController::class, 'show']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
            Route::patch('/users/{user}/toggle', [UserController::class, 'toggleActive']);

            // Dashboard admin stats
            Route::get('/admin/stats', [AdminController::class, 'stats']);

            // Dashboard vendeur
            Route::get('/vendor/stats', [VendorController::class, 'stats']);
            Route::get('/vendor/products', [VendorController::class, 'myProducts']);

            // Chat admin
            Route::get('/admin/conversations', [ChatController::class, 'adminConversations']);
            Route::get('/admin/conversations/{conversation}/messages', [ChatController::class, 'adminMessages']);
            Route::post('/admin/conversations/{conversation}/reply', [ChatController::class, 'adminReply']);
            Route::patch('/admin/conversations/{conversation}/close', [ChatController::class, 'closeConversation']);
        });

        // --- ESPACE ACHETEURS (Ou n'importe quel connecté) ---
        Route::middleware(['role:acheteur|vendeur|admin'])->group(function () {
            // Gestion des commandes
            Route::get('/orders', [OrderController::class, 'index']);
            Route::post('/orders', [OrderController::class, 'store']);
            Route::get('/orders/{order}', [OrderController::class, 'show']);
        });

        // Gestion du panier
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    });
});