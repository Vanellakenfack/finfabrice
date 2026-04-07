<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Chercher l'utilisateur existant ou le créer
        $admin = User::firstOrCreate(
            ['email' => 'admin@eliteshop.com'],
            [
                'name' => 'Administrateur',
                'phone' => '123456789',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        // Assigner le rôle admin
        $admin->assignRole('admin');

        $this->command->info('Admin prêt !');
        $this->command->info('Email: admin@eliteshop.com');
        $this->command->info('Mot de passe: admin123');
    }
}
