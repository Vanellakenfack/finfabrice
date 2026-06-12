<?php

namespace App\Models\Chat;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Conversation extends Model
{
    protected $fillable = [
        'user_id', 'guest_token', 'guest_name', 'guest_email',
        'status', 'unread_admin', 'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function lastMessage(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->latest()->limit(1);
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->user) return $this->user->name;
        return $this->guest_name ?? 'Visiteur';
    }

    public function getDisplayEmailAttribute(): string
    {
        if ($this->user) return $this->user->email;
        return $this->guest_email ?? '';
    }
}
