<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Catalog\Category;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CategoryResource;

class CategoryController extends Controller
{
    /**
     * Liste toutes les catégories (Public)
     */
    public function index()
    {
        return CategoryResource::collection(Category::all());
    }

    /**
     * Créer une catégorie (Admin/Vendeur)
     */
    public function store(Request $request)
{
    // 1. Validation simplifiée pour tester si le timeout disparaît
    $request->validate([
        'name' => 'required|string|max:255', // On retire 'unique' pour le test
    ]);

    try {
        // 2. Création manuelle du slug si ton modèle ne le fait pas
        $category = Category::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'data'    => new CategoryResource($category)
        ], 201);

    } catch (\Exception $e) {
        // Si ça crash ici, l'erreur s'affichera dans ton inspecteur React (Network tab)
        return response()->json([
            'error' => 'Erreur de base de données',
            'details' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Mettre à jour une catégorie (Admin/Vendeur)
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $category->update([
                'name'        => $request->name,
                'slug'        => Str::slug($request->name),
                'description' => $request->description,
            ]);

            return response()->json([
                'message' => 'Catégorie mise à jour avec succès',
                'data'    => new CategoryResource($category)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur de base de données',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une catégorie (Admin/Vendeur)
     */
    public function destroy(Category $category)
    {
        try {
            $category->delete();

            return response()->json([
                'message' => 'Catégorie supprimée avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur de base de données',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}