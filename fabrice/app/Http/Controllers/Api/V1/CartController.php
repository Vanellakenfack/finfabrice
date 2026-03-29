<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Cart;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    // Afficher le panier de l'utilisateur connecté
    public function index(Request $request)
    {
        $cartItems = Cart::where('user_id', $request->user()->id)
            ->with('product')
            ->get();

        return response()->json([
            'items' => $cartItems,
            'total_items' => $cartItems->sum('quantity')
        ]);
    }

    // Ajouter un produit au panier (ou augmenter la quantité)
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1'
        ]);

        $cart = Cart::updateOrCreate(
            [
                'user_id'    => $request->user()->id,
                'product_id' => $request->product_id,
            ],
            [
                'quantity'   => \DB::raw("quantity + {$request->quantity}")
            ]
        );

        return response()->json(['message' => 'Produit ajouté au panier']);
    }

    // Supprimer un article du panier
    public function destroy($id)
    {
        Cart::where('user_id', auth()->id())->where('id', $id)->delete();
        return response()->json(['message' => 'Article retiré du panier']);
    }
}