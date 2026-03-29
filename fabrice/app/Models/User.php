<?php
namespace App\Models;

use App\Models\Catalog\Product;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
// Force le guard web pour éviter l'erreur de Spatie si vous n'avez pas défini de guard API spécifique
protected $guard_name = 'web';
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'two_factor_enabled',
        'odoo_partner_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_enabled' => 'boolean',
    ];

    /**
     * Un utilisateur (Vendeur) peut avoir plusieurs produits.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}