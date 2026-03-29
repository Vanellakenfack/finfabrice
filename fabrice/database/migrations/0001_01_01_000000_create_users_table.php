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
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('phone')->unique()->nullable(); // Ajouté pour l'inscription mobile 
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        
        // Gestion des Rôles [cite: 48]
        $table->enum('role', ['admin', 'vendeur', 'acheteur', 'transporteur'])->default('acheteur');
        
        // Sécurité [cite: 72, 102]
        $table->boolean('two_factor_enabled')->default(false);
        $table->string('two_factor_code')->nullable(); 

        // Intégration Odoo 
        $table->string('odoo_partner_id')->nullable(); 

        $table->rememberToken();
        $table->timestamps();
    });

    // Les tables password_reset_tokens et sessions restent inchangées
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
