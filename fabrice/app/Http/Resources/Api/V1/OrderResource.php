<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray($request): array
{
    return [
        'id'               => $this->id,
        'reference'        => $this->reference,
        'total'            => (float) $this->total_amount,
        'status'           => $this->status,
        'shipping_address' => $this->shipping_address,
        'items'            => $this->items->map(fn($item) => [
            'product_name' => $item->product->name,
            'quantity'     => $item->quantity,
            'unit_price'   => (float) $item->price,
            'subtotal'     => $item->quantity * $item->price,
        ]),
        'date'             => $this->created_at->format('d/m/Y H:i'),
    ];
}
}
