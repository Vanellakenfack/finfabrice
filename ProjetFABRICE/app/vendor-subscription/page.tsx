'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
// Correction des chemins d'importation (componets sans 'n')
import { Card, CardContent, CardHeader, CardTitle } from "../componets/ui/card";
import { Button } from "../componets/ui/button";
import { CheckCircle2, Star, Sparkles, Shield, Globe, Clock, HeadphonesIcon, Store, Rocket, Building2, Zap } from "lucide-react";

export default function VendorSubscriptionPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  // L'état qui gère le plan actuellement mis en avant
  const [selectedPlan, setSelectedPlan] = useState<string | null>("pro");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = (plan: string) => {
    setIsRedirecting(true);
    // Logique de redirection vers le tunnel de paiement
    router.push(`/checkout/subscription?type=vendor&plan=${plan}&cycle=${billingCycle}`);
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: Store,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      monthlyPrice: "19€",
      yearlyPrice: "190€",
      features: ["20 produits maximum", "Support standard", "Statistiques basiques", "Visibilité standard"],
      buttonText: "Choisir Starter",
      borderColor: "border-orange-500"
    },
    {
      id: "pro",
      name: "Professional",
      icon: Rocket,
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      monthlyPrice: "39€",
      yearlyPrice: "390€",
      features: ["Produits illimités", "Support prioritaire", "Analytics avancées", "Mise en avant marketplace", "Badge 'Vendeur Pro'"],
      buttonText: "DÉMARRER MAINTENANT",
      borderColor: "border-orange-600",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Building2,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      monthlyPrice: "79€",
      yearlyPrice: "790€",
      features: ["Compte dédié", "Publicité sponsorisée", "API & intégrations", "Gestionnaire de compte"],
      buttonText: "Choisir Enterprise",
      borderColor: "border-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-6">
      <div className="relative max-w-3xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-orange-200 text-orange-600 text-sm font-bold mb-4 shadow-lg">
          <Zap className="w-4 h-4 fill-orange-600" />
          <span>PROGRAMME VENDEUR</span>
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Devenez <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Vendeur Professionnel</span>
        </h1>
        
        {/* Toggle Billing */}
        <div className="mt-6 flex justify-center">
          <div className="flex p-1 bg-white rounded-xl shadow-md border border-gray-200">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-orange-500 text-white shadow-lg" : "text-gray-500"}`}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "yearly" ? "bg-orange-500 text-white shadow-lg" : "text-gray-500"}`}
            >
              Annuel (-20%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          return (
            <div 
              key={plan.id} 
              onClick={() => setSelectedPlan(plan.id)} // AJOUT : Met à jour le plan sélectionné au clic
              className="cursor-pointer h-full"
            >
              <Card className={`relative h-full border-2 transition-all duration-500 ease-in-out ${
                isSelected 
                  ? 'border-orange-500 shadow-2xl scale-105 z-10 bg-white' 
                  : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-orange-300 scale-100'
              }`}>
                
                {/* Petit indicateur visuel (Check) quand sélectionné */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${plan.iconBg} rounded-lg flex items-center justify-center mx-auto mb-3 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                    <Icon className={`${plan.iconColor} w-6 h-6`} />
                  </div>
                  <CardTitle className={`text-xl font-bold transition-colors ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-center flex flex-col h-full">
                  <div className="text-3xl font-black text-orange-500 mb-6">
                    {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    <span className="text-sm text-gray-400 font-normal">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left flex-grow">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche le déclenchement du onClick de la Card
                      handleCheckout(plan.id);
                    }}
                    className={`w-full py-6 font-bold transition-all ${
                      isSelected 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    variant={isSelected ? "default" : "secondary"}
                  >
                    {isRedirecting && selectedPlan === plan.id ? "Redirection..." : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}