<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Catalog\Product;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('is_active', true)
            ->with(['category', 'seller'])
            ->latest()
            ->paginate(15);

        return ProductResource::collection($products);
    }

    public function adminIndex(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('low_stock')) {
            $query->where('quantity', '<', 5);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    public function toggleActive(Product $product)
    {
        $authUser = auth('sanctum')->user();
        if ($authUser->id !== $product->user_id && !$authUser->hasRole('admin')) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'message'   => 'Statut mis à jour',
            'is_active' => $product->is_active,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
       
    
        // Gestion de l'image uploadée
        $imagesUrl = null;
        if ($request->hasFile('images')) {
            $path = $request->file('images')->store('products', 'public');
            $imagesUrl = '/storage/' . $path;
        }

        // Création du produit avec l'image
        $product = Product::create([
            'user_id'     => $request->user()->id,
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . uniqid(),
            'description' => $request->description,
            'price'       => $request->price,
            'quantity'    => $request->quantity,
            'images'      => $imagesUrl, // Stocke l'URL de l'image
            'is_active'   => true,
        ]);

        return response()->json([
            'message' => 'Produit créé avec succès',
            'product' => new ProductResource($product->load(['category', 'seller']))
        ], 201);
    }

    public function show(Product $product)
    {
        // Simple vérification de disponibilité
        if (!$product->is_active && (!auth('sanctum')->check() || auth('sanctum')->user()->id !== $product->user_id)) {
            return response()->json(['message' => 'Produit non disponible'], 404);
        }

        return new ProductResource($product->load(['category', 'seller']));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();
        
        // Gestion de l'image uploadée
        if ($request->hasFile('images')) {
            $path = $request->file('images')->store('products', 'public');
            $data['images'] = '/storage/' . $path;
        }
        
        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name) . '-' . uniqid();
        }

        $product->update($data);

        return response()->json([
            'message' => 'Produit mis à jour avec succès',
            'product' => new ProductResource($product->load(['category', 'seller']))
        ]);
    }

    public function destroy(Product $product)
    {
        $authUser = auth('sanctum')->user();
        if ($authUser->id !== $product->user_id && !$authUser->hasRole('admin')) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $product->delete();
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }
}