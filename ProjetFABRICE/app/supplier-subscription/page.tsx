'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../componets/ui/card";
import { Button } from "../componets/ui/button";
import { CheckCircle2, Factory, Package, Truck, Zap, Star, Sparkles, Shield, Globe, Clock, HeadphonesIcon } from "lucide-react";

export default function SupplierSubscriptionPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>("premium");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = (plan: string) => {
    setIsRedirecting(true);
    
    // Redirection vers la page de checkout subscription
    // Note: Le chemin est /checkout/subscription (pas /checkout)
    router.push(`/checkout/subscription?type=supplier&plan=${plan}&cycle=${billingCycle}`);
  };

  const plans = [
    {
      id: "basic", // Changé de "distributor" à "basic"
      name: "Distributeur",
      icon: Package,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      monthlyPrice: "49€",
      yearlyPrice: "490€",
      features: [
        "Gestion de stock basique",
        "Jusqu'à 100 références",
        "Facturation automatisée",
        "Support standard"
      ],
      buttonText: "Choisir Distributeur",
      borderColor: "border-orange-500"
    },
    {
      id: "premium", // Changé de "wholesaler" à "premium"
      name: "Grossiste Pro",
      icon: Truck,
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      monthlyPrice: "129€",
      yearlyPrice: "1290€",
      features: [
        "Catalogues illimités",
        "Accès API Sourcing",
        "Gestion des tarifs dégressifs",
        "Support dédié 24/7",
        "Badge 'Vérifié'",
        "Analyses avancées"
      ],
      buttonText: "DÉMARRER MAINTENANT",
      borderColor: "border-orange-500",
      popular: true
    },
    {
      id: "enterprise", // Option pour un plan enterprise si besoin
      name: "Usine & Import",
      icon: Factory,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      monthlyPrice: "299€",
      yearlyPrice: "2990€",
      features: [
        "Intégration ERP complète",
        "Gestion multi-entrepôts",
        "Priorité appels d'offres",
        "Account Manager dédié",
        "Logistique internationale"
      ],
      buttonText: "Choisir Usine",
      borderColor: "border-slate-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 py-12 px-6">
      
      {/* Hero Section */}
      <div className="relative max-w-3xl mx-auto mb-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 to-orange-100/50 blur-3xl -z-10" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-600 text-sm font-bold mb-4 shadow-lg shadow-orange-100/50">
          <Zap className="w-4 h-4 fill-orange-600" />
          <span>PROGRAMME PARTENAIRE B2B</span>
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Espace <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Fournisseur</span>
        </h1>
        
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
          Propulsez votre activité de gros. Accédez à un réseau de distribution puissant.
        </p>

        {/* Toggle Billing */}
        <div className="mt-6 flex justify-center">
          <div className="relative p-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            <div className="flex gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {billingCycle === "monthly" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg shadow-orange-200" />
                )}
                <span className="relative z-10">Mensuel</span>
              </button>
              
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`relative px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                  billingCycle === "yearly"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {billingCycle === "yearly" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg shadow-orange-200" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Annuel
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-400 text-white rounded-md">
                    -20%
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto -mt-2">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`group cursor-pointer transition-all duration-500 ease-out ${
                isSelected ? 'md:scale-105 z-10' : 'md:scale-100 opacity-90 hover:opacity-100'
              }`}
            >
              <Card className={`relative h-full rounded-2xl border-2 transition-all duration-500 overflow-hidden
                ${isSelected 
                  ? `border-orange-500 shadow-2xl shadow-orange-200/50 bg-white` 
                  : 'border-gray-200 hover:border-orange-300 shadow-md hover:shadow-xl bg-white/80 backdrop-blur-sm'
                }`}
              >
                {/* Badge "Recommandé" */}
                {plan.popular && (
                  <div className={`absolute top-0 right-0 transition-all duration-500 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg' 
                      : 'bg-orange-400'
                  } text-white px-5 py-1.5 rounded-bl-xl text-xs font-black uppercase tracking-widest z-20`}>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Recommandé
                    </div>
                  </div>
                )}

                {/* Effet de brillance */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                  isSelected ? 'opacity-100' : 'opacity-0'
                }`} />

                <CardHeader className={`pt-6 text-center transition-all duration-500 ${
                  isSelected ? 'pt-8' : ''
                }`}>
                  <div className={`w-14 h-14 ${plan.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-500 ${
                    isSelected ? 'scale-110 shadow-lg' : 'group-hover:scale-105'
                  }`}>
                    <Icon className={`${plan.iconColor} w-7 h-7`} />
                  </div>
                  
                  <CardTitle className={`text-xl font-bold transition-all duration-500 ${
                    isSelected ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="text-center mb-6">
                    <span className={`text-4xl font-black transition-all duration-500 ${
                      isSelected ? 'text-orange-500' : 'text-gray-900'
                    }`}>
                      {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">
                      /{billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600 text-sm group/item">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                          isSelected 
                            ? 'text-orange-500' 
                            : 'text-gray-400 group-hover/item:text-orange-400'
                        }`} />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full py-5 rounded-xl font-bold text-sm transition-all duration-500 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-200 active:scale-95'
                        : `border-2 ${plan.borderColor} hover:bg-orange-50 hover:border-orange-500`
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckout(plan.id);
                    }}
                    disabled={isRedirecting && selectedPlan === plan.id}
                  >
                    {isRedirecting && selectedPlan === plan.id ? "Redirection..." : plan.buttonText}
                  </Button>
                </CardContent>

                {/* Badge de sélection */}
                {isSelected && (
                  <div className="absolute top-3 left-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Section des avantages */}
      <div className="mt-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Paiement sécurisé", desc: "Transactions cryptées" },
            { icon: Globe, label: "B2B Verified", desc: "Partenaires certifiés" },
            { icon: Clock, label: "Support 24/7", desc: "Assistance prioritaire" },
            { icon: HeadphonesIcon, label: "Account Manager", desc: "Suivi personnalisé" }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:text-orange-500 transition-all">
                <item.icon className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
              </div>
              <p className="font-bold text-sm text-gray-800">{item.label}</p>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          Contrat sans engagement pour les plans mensuels. Tous les tarifs sont HT.
        </p>
      </div>
    </div>
  );
}