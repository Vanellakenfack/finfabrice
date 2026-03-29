<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\Api\V1\UserResource;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur (Acheteur ou Vendeur)
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // Attribution du rôle selon le CDC (acheteur ou vendeur) [cite: 50, 51]
        $user->assignRole($request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Connexion sécurisée avec vérification des rôles [cite: 70, 72]
     */
   public function login(LoginRequest $request)
{
    // On récupère l'utilisateur
    $user = User::where('email', trim($request->email))->first();

    // LOGS DE PRÉCISION
    \Log::info('--- TENTATIVE DE CONNEXION ---');
    \Log::info('Email reçu du Frontend: "' . $request->email . '"');
    \Log::info('Password reçu du Frontend: "' . $request->password . '"');
    
    if (!$user) {
        \Log::error('RÉSULTAT: Utilisateur introuvable en base de données.');
        throw ValidationException::withMessages(['email' => ['Utilisateur non trouvé.']]);
    }

    $isPasswordCorrect = Hash::check($request->password, $user->password);
    \Log::info('Le mot de passe correspond au Hash ? ' . ($isPasswordCorrect ? 'OUI' : 'NON'));

    if (!$isPasswordCorrect) {
        throw ValidationException::withMessages(['email' => ['Mot de passe incorrect.']]);
    }

    // Si on arrive ici, tout est bon, on génère le token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => new UserResource($user),
    ]);
}
    /**
     * Déconnexion (Révocation du token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }
}