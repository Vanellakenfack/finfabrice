<?php

namespace App\Events;

use App\Models\Chat\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        $token = $this->message->conversation->guest_token
            ?? 'user-' . $this->message->conversation->user_id;

        return [
            // Canal client (public, identifié par token unique)
            new Channel('chat.' . $token),
            // Canal admin (reçoit tous les messages)
            new Channel('chat.admin'),
        ];
    }

    public function broadcastWith(): array
    {
        $conv = $this->message->conversation;
        return [
            'id'              => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'content'         => $this->message->content,
            'is_admin'        => $this->message->is_admin,
            'sender_name'     => $this->message->sender_name,
            'created_at'      => $this->message->created_at->toISOString(),
            'conversation'    => [
                'id'           => $conv->id,
                'display_name' => $conv->display_name,
                'guest_token'  => $conv->guest_token,
                'status'       => $conv->status,
                'unread_admin' => $conv->unread_admin,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
