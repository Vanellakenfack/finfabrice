<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Création des rôles pour le guard web (par défaut)
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'vendeur']);
        Role::create(['name' => 'acheteur']);
    }
}