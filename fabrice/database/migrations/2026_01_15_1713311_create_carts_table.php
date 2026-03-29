<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up(): void
{
    Schema::create('carts', function (Blueprint $table) {
        $table->id();
        // L'utilisateur qui possède ce panier
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Le produit ajouté
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        
        // La quantité choisie
        $table->integer('quantity')->default(1);
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
