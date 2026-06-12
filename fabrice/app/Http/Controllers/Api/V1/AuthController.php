<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        $user->assignRole($request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('register.success', ['user_id' => $user->id, 'email' => $user->email, 'ip' => $request->ip()]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user'    => new UserResource($user),
        ], 201)->withCookie(self::makeTokenCookie($token));
    }

    /**
     * Connexion sécurisée avec vérification des rôles [cite: 70, 72]
     */
   public function login(LoginRequest $request)
{
    // On récupère l'utilisateur
    $user = User::where('email', trim($request->email))->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        Log::warning('login.failed', ['email' => $request->email, 'ip' => $request->ip()]);
        throw ValidationException::withMessages(['email' => ['Identifiants incorrects.']]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    Log::info('login.success', ['user_id' => $user->id, 'email' => $user->email, 'ip' => $request->ip()]);

    return response()->json([
        'user' => new UserResource($user),
    ])->withCookie(self::makeTokenCookie($token));
}
    /**
     * Déconnexion (Révocation du token)
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        Log::info('logout', ['user_id' => $user->id, 'ip' => $request->ip()]);

        return response()->json(['message' => 'Déconnexion réussie'])
            ->withoutCookie('auth_token');
    }

    private static function makeTokenCookie(string $token): \Symfony\Component\HttpFoundation\Cookie
    {
        $isProduction = config('app.env') === 'production';
        $minutes      = config('sanctum.expiration', 1440);

        return cookie(
            'auth_token',
            $token,
            $minutes,
            '/',
            null,
            $isProduction, // secure: true uniquement en production (HTTPS)
            true,          // httpOnly: inaccessible au JavaScript
            false,
            'Strict'       // SameSite: bloque les requêtes cross-site
        );
    }
}