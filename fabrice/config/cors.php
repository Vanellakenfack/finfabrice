<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

   // config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register','products','/products','*' ],

'allowed_methods' => ['*'],

// Remplace '*' par l'URL exacte de ton Next.js
'allowed_origins' => ['*'], 

'allowed_origins_patterns' => [],

'allowed_headers' => ['*'],

'exposed_headers' => [],

'max_age' => 0,

// TRÈS IMPORTANT : doit être à true
'supports_credentials' => true,

];
