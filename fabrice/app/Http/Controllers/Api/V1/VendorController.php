<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Catalog\Product;
use App\Models\Sales\Order;
use App\Models\Sales\OrderItem;
use App\Http\Resources\Api\V1\ProductResource;

class VendorController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;
        $startOfMonth = now()->startOfMonth();

        // KPIs produits
        $totalProducts  = Product::where('user_id', $userId)->count();
        $activeProducts = Product::where('user_id', $userId)->where('is_active', true)->count();
        $lowStock       = Product::where('user_id', $userId)->where('quantity', '<', 5)->where('is_active', true)->count();

        // Ventes & revenus du mois courant
        $monthlySales = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $userId)
            ->where('orders.created_at', '>=', $startOfMonth)
            ->whereNull('orders.deleted_at')
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as total_qty')
            ->selectRaw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_revenue')
            ->first();

        // Commandes en attente contenant au moins un produit de ce vendeur
        $pendingOrders = Order::whereHas('items.product', fn($q) => $q->where('user_id', $userId))
            ->where('status', 'pending')
            ->count();

        // Top 5 produits par quantité vendue (toutes périodes)
        $topProducts = Product::where('products.user_id', $userId)
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->select(
                'products.id',
                'products.name',
                'products.quantity as stock',
                'products.price',
            )
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as total_sold')
            ->selectRaw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_revenue')
            ->groupBy('products.id', 'products.name', 'products.quantity', 'products.price')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // Commandes récentes contenant les produits du vendeur
        $recentOrders = Order::with(['user:id,name,email', 'items.product:id,name,user_id'])
            ->whereHas('items.product', fn($q) => $q->where('user_id', $userId))
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn($order) => [
                'id'        => $order->id,
                'reference' => $order->reference,
                'client'    => $order->user?->name ?? $order->user?->email ?? 'Client inconnu',
                'montant'   => $order->total_amount,
                'statut'    => $order->status,
                'date'      => $order->created_at->toDateString(),
            ]);

        // Évolution mensuelle (6 derniers mois)
        $monthlyRevenue = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $userId)
            ->where('orders.created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->whereNull('orders.deleted_at')
            ->selectRaw("DATE_FORMAT(orders.created_at, '%Y-%m') as month")
            ->selectRaw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as revenue')
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as sales')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'kpis' => [
                'total_products'  => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock'       => $lowStock,
                'monthly_sales'   => (int) $monthlySales->total_qty,
                'monthly_revenue' => (float) $monthlySales->total_revenue,
                'pending_orders'  => $pendingOrders,
            ],
            'top_products'    => $topProducts,
            'recent_orders'   => $recentOrders,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    public function myProducts(Request $request)
    {
        $userId = $request->user()->id;

        $query = Product::with(['category'])
            ->where('user_id', $userId);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('low_stock')) {
            $query->where('quantity', '<', 5);
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }
}
