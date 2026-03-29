<?php

namespace App\Notifications\Sales;

use App\Models\Sales\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class OrderPlacedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['mail', 'database']; // Envoi par email et stockage en base pour le dashboard
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle commande reçue ! #' . $this->order->reference)
            ->greeting('Bonjour ' . $notifiable->name)
            ->line('Vous avez reçu une nouvelle commande sur la plateforme.')
            ->line('Référence : ' . $this->order->reference)
            ->line('Montant total : ' . $this->order->total_amount . '€')
            ->action('Voir la commande', url('/dashboard/orders/' . $this->order->id))
            ->line('Merci de préparer l’expédition au plus vite.');
    }

    public function toArray($notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference' => $this->order->reference,
            'amount' => $this->order->total_amount,
        ];
    }
}