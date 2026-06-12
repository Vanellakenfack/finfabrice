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
        abort_unless(
            $request->user() && $request->user()->hasRole(['vendeur', 'admin']),
            403,
            'Action non autorisée.'
        );

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        try {
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
            return response()->json([
                'error' => 'Erreur de base de données',
            ], 500);
        }
    }

    /**
     * Afficher une catégorie (Admin/Vendeur)
     */
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    /**
     * Mettre à jour une catégorie (Admin/Vendeur)
     */
    public function update(Request $request, Category $category)
    {
        abort_unless(
            $request->user() && $request->user()->hasRole(['vendeur', 'admin']),
            403,
            'Action non autorisée.'
        );

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
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
            return response()->json(['error' => 'Erreur de base de données'], 500);
        }
    }

    /**
     * Supprimer une catégorie (Admin/Vendeur)
     */
    public function destroy(Request $request, Category $category)
    {
        abort_unless(
            $request->user() && $request->user()->hasRole(['vendeur', 'admin']),
            403,
            'Action non autorisée.'
        );

        try {
            $category->delete();

            return response()->json([
                'message' => 'Catégorie supprimée avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur de base de données'], 500);
        }
    }
}