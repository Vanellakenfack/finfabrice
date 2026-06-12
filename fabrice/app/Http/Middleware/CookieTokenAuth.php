<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CookieTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Si aucun Bearer token dans le header mais qu'un cookie auth_token existe,
        // on reconstruit le header Authorization pour que Sanctum l'accepte.
        if (!$request->bearerToken() && $request->cookie('auth_token')) {
            $request->headers->set(
                'Authorization',
                'Bearer ' . $request->cookie('auth_token')
            );
        }

        return $next($request);
    }
}
