<?php
namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Autoriser tous les visiteurs à s'inscrire
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'    => ['nullable', 'string', 'max:20', 'unique:users'], // Inscription via téléphone 
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()], // Sécurité [cite: 39]
            'role'     => ['required', 'string', 'in:vendeur,acheteur'], // Acteurs [cite: 48]
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cet email est déjà utilisé.',
            'role.in'      => 'Le rôle doit être soit acheteur, soit vendeur.',
        ];
    }
}