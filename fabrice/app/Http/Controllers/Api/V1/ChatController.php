<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Models\Chat\Conversation;
use App\Models\Chat\ChatMessage;
use App\Events\ChatMessageSent;

class ChatController extends Controller
{
    // Démarrer ou récupérer une conversation
    public function startConversation(Request $request)
    {
        $request->validate([
            'guest_name'  => 'nullable|string|max:100',
            'guest_email' => 'nullable|email|max:191',
            'guest_token' => 'nullable|string|max:191',
        ]);

        $user = auth('sanctum')->user();

        // Utilisateur connecté — retrouver ou créer sa conversation
        if ($user) {
            $conversation = Conversation::firstOrCreate(
                ['user_id' => $user->id, 'status' => 'open'],
                ['guest_name' => $user->name, 'guest_email' => $user->email]
            );
            return response()->json($this->conversationData($conversation, true));
        }

        // Invité avec token existant — retrouver la conversation
        if ($request->guest_token) {
            $conversation = Conversation::where('guest_token', $request->guest_token)
                ->where('status', 'open')
                ->first();
            if ($conversation) {
                return response()->json($this->conversationData($conversation, true));
            }
        }

        // Nouvelle conversation invité
        $conversation = Conversation::create([
            'guest_token' => Str::uuid()->toString(),
            'guest_name'  => $request->guest_name ?? 'Visiteur',
            'guest_email' => $request->guest_email,
        ]);

        return response()->json($this->conversationData($conversation, true), 201);
    }

    // Récupérer les messages d'une conversation
    public function messages(Request $request, $token)
    {
        $conversation = $this->findConversation($token, $request);
        if (!$conversation) return response()->json(['message' => 'Conversation introuvable'], 404);

        $messages = $conversation->messages()->oldest()->get()->map(fn($m) => [
            'id'          => $m->id,
            'content'     => $m->content,
            'is_admin'    => $m->is_admin,
            'sender_name' => $m->sender_name,
            'created_at'  => $m->created_at->toISOString(),
        ]);

        return response()->json($messages);
    }

    // Envoyer un message (client)
    public function sendMessage(Request $request, $token)
    {
        $request->validate(['content' => 'required|string|max:2000']);

        $conversation = $this->findConversation($token, $request);
        if (!$conversation) return response()->json(['message' => 'Conversation introuvable'], 404);

        $user = auth('sanctum')->user();
        $senderName = $user?->name ?? $conversation->guest_name ?? 'Visiteur';

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'is_admin'        => false,
            'sender_name'     => $senderName,
            'content'         => $request->content,
        ]);

        $conversation->increment('unread_admin');
        $conversation->update(['last_message_at' => now()]);

        $message->load('conversation');
        $this->safeBroadcast($message);

        return response()->json([
            'id'          => $message->id,
            'content'     => $message->content,
            'is_admin'    => false,
            'sender_name' => $message->sender_name,
            'created_at'  => $message->created_at->toISOString(),
        ], 201);
    }

    // ---- ADMIN ----

    // Liste toutes les conversations (admin)
    public function adminConversations(Request $request)
    {
        $conversations = Conversation::with(['user:id,name,email', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id'           => $c->id,
                'display_name' => $c->display_name,
                'display_email'=> $c->display_email,
                'guest_token'  => $c->guest_token ?? 'user-' . $c->user_id,
                'status'       => $c->status,
                'unread_admin' => $c->unread_admin,
                'last_message' => $c->messages->first()?->content,
                'last_message_at' => $c->last_message_at?->toISOString(),
            ]);

        return response()->json($conversations);
    }

    // L'admin répond à une conversation
    public function adminReply(Request $request, Conversation $conversation)
    {
        $request->validate(['content' => 'required|string|max:2000']);

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'is_admin'        => true,
            'sender_name'     => 'Support',
            'content'         => $request->content,
        ]);

        // Réinitialiser le compteur non-lus admin
        $conversation->update([
            'unread_admin'    => 0,
            'last_message_at' => now(),
        ]);

        $message->load('conversation');
        $this->safeBroadcast($message);

        return response()->json([
            'id'          => $message->id,
            'content'     => $message->content,
            'is_admin'    => true,
            'sender_name' => $message->sender_name,
            'created_at'  => $message->created_at->toISOString(),
        ], 201);
    }

    // Fermer une conversation
    public function closeConversation(Conversation $conversation)
    {
        $conversation->update(['status' => 'closed']);
        return response()->json(['message' => 'Conversation fermée']);
    }

    // Récupérer les messages d'une conversation (admin)
    public function adminMessages(Conversation $conversation)
    {
        $messages = $conversation->messages()->oldest()->get()->map(fn($m) => [
            'id'          => $m->id,
            'content'     => $m->content,
            'is_admin'    => $m->is_admin,
            'sender_name' => $m->sender_name,
            'created_at'  => $m->created_at->toISOString(),
        ]);
        return response()->json($messages);
    }

    // Retrouver une conversation par email (invité)
    public function findByEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $conversation = Conversation::where('guest_email', $request->email)
            ->latest()
            ->first();

        if (!$conversation) {
            return response()->json(['message' => 'Aucune conversation trouvée pour cet email.'], 404);
        }

        // Redonner le token dans localStorage
        return response()->json($this->conversationData($conversation));
    }

    // ---- HELPERS ----
    private function conversationData(Conversation $c, bool $withMessages = false): array
    {
        $data = [
            'id'          => $c->id,
            'token'       => $c->guest_token ?? 'user-' . $c->user_id,
            'status'      => $c->status,
            'guest_name'  => $c->display_name,
            'guest_email' => $c->display_email,
        ];

        if ($withMessages) {
            $data['messages'] = $c->messages()->oldest()->get()->map(fn($m) => [
                'id'          => $m->id,
                'content'     => $m->content,
                'is_admin'    => $m->is_admin,
                'sender_name' => $m->sender_name,
                'created_at'  => $m->created_at->toISOString(),
            ])->values();
        }

        return $data;
    }

    private function findConversation(string $token, Request $request): ?Conversation
    {
        // Token de la forme user-{id} pour les connectés
        if (str_starts_with($token, 'user-')) {
            $userId = (int) substr($token, 5);
            return Conversation::where('user_id', $userId)->first();
        }
        return Conversation::where('guest_token', $token)->first();
    }

    private function safeBroadcast($message): void
    {
        try {
            broadcast(new ChatMessageSent($message));
        } catch (\Exception $e) {
            \Log::warning('Chat broadcast failed (Reverb offline?): ' . $e->getMessage());
        }
    }
}
