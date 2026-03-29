<?php



namespace App\Http\Controllers\Api\V1;

use App\Models\Sales\Order;
use App\Models\Sales\OrderItem;
use App\Models\Catalog\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Requests\Api\V1\Order\StoreOrderRequest;

class OrderController extends Controller
{
    /**
     * Liste des commandes de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['items.product'])
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * Passage d'une commande (Processus critique)
     */
    public function store(StoreOrderRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            // 1. Parcourir les produits du panier/requête
            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                // Vérification du stock
                if ($product->quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Stock insuffisant pour le produit : {$product->name}"
                    ], 422);
                }

                $price = $product->price * $item['quantity'];
                $totalAmount += $price;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'price'      => $product->price, // On fige le prix au moment de l'achat
                ];

                // 2. Déduction du stock
                $product->decrement('quantity', $item['quantity']);
            }

            // 3. Création de la commande principale
            $order = Order::create([
                'user_id'          => $request->user()->id,
                'reference'        => 'CMD-' . strtoupper(uniqid()),
                'total_amount'     => $totalAmount,
                'status'           => 'pending',
                'shipping_address' => $request->shipping_address,
                'payment_method'   => $request->payment_method,
            ]);

            // 4. Création des lignes de commande
            foreach ($itemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            return response()->json([
                'message' => 'Commande passée avec succès',
                'order'   => new OrderResource($order->load('items.product'))
            ], 201);
        });
    }

    /**
     * Détails d'une commande
     */
    public function show(Order $order)
    {
        // Vérifier que l'utilisateur est propriétaire ou admin
        if (auth()->user()->id !== $order->user_id && !auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return new OrderResource($order->load(['items.product', 'user']));
    }
}