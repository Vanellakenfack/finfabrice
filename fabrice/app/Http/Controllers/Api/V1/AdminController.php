<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Catalog\Product;
use App\Models\Catalog\Category;
use App\Models\Sales\Order;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers    = User::count();
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $lowStockCount = Product::where('is_active', true)->where('quantity', '<', 5)->count();

        // Produits en stock faible
        $lowStockProducts = Product::where('is_active', true)
            ->where('quantity', '<', 5)
            ->with('category')
            ->orderBy('quantity')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'quantity' => $p->quantity,
                'category' => $p->category?->name,
                'price'    => $p->price,
            ]);

        // Revenus mensuels (6 derniers mois)
        $monthlyRevenue = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Commandes par statut
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($r) => [$r->status => $r->count]);

        // Activité récente (5 dernières commandes + 5 derniers inscrits)
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'type'      => 'order',
                'reference' => $o->reference,
                'user'      => $o->user?->name ?? 'Inconnu',
                'amount'    => $o->total_amount,
                'status'    => $o->status,
                'at'        => $o->created_at->toIso8601String(),
            ]);

        $recentUsers = User::latest()
            ->take(5)
            ->get()
            ->map(fn($u) => [
                'type'  => 'user',
                'name'  => $u->name,
                'email' => $u->email,
                'role'  => $u->roles->first()?->name ?? 'acheteur',
                'at'    => $u->created_at->toIso8601String(),
            ]);

        $recentActivity = collect($recentOrders)
            ->merge($recentUsers)
            ->sortByDesc('at')
            ->take(8)
            ->values();

        return response()->json([
            'kpis' => [
                'users'          => $totalUsers,
                'products'       => $totalProducts,
                'categories'     => $totalCategories,
                'orders'         => $totalOrders,
                'revenue'        => round((float) $totalRevenue, 2),
                'pending_orders' => $pendingOrders,
                'low_stock'      => $lowStockCount,
            ],
            'low_stock_products' => $lowStockProducts,
            'monthly_revenue'    => $monthlyRevenue,
            'orders_by_status'   => $ordersByStatus,
            'recent_activity'    => $recentActivity,
        ]);
    }
}
