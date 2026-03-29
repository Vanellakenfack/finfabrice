<?php
namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Seuls les vendeurs et admins peuvent créer un produit
        // return $this->user()->hasRole(['vendeur', 'admin']);
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'quantity'    => ['nullable', 'integer', 'min:0'],
            'images'      => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'], // Max 5MB
        ];
    }
}