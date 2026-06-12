<?php

namespace App\Models\Catalog;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 
        'category_id', 
        'name', 
        'slug', 
        'description', 
        'price', 
        'quantity',
        'images',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'is_active' => 'boolean'
    ];

    // Relation vers le vendeur (User)
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relation vers la catégorie
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}