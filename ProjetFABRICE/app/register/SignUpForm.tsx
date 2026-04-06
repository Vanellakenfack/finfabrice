'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { authService } from "../../services/auth.service";

import { Button } from "../componets/ui/button";
import { Input } from "../componets/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componets/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../componets/ui/select";

// Schema mis à jour avec 'fournisseur'
const signUpSchema = z.object({
    fullName: z.string().min(2, 'Le nom est trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(9, 'Numéro invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
    role: z.enum(['acheteur', 'vendeur', 'fournisseur']), // Ajout fournisseur ici
    acceptTerms: z.boolean().refine(val => val === true, 'Obligatoire'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

// Ajout de la prop onSuccess pour communiquer avec Register.tsx
interface SignUpFormProps {
    onSuccess: (data?: { type: 'email' | 'phone'; contact: string }) => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { role: 'acheteur', acceptTerms: false },
    });

    const onSubmit = async (data: SignUpFormValues) => {
        try {
            const payload = {
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.confirmPassword,
                role: data.role
            };

            await authService.register(payload);
            
            // LOGIQUE OTP : On appelle onSuccess au lieu du simple alert
            if (onSuccess) {
                onSuccess({
                    type: 'email',
                    contact: data.email
                });
            } else {
                router.push('/login');
            }
        } catch (error: any) {
            console.error('Erreur:', error?.response?.data || error);
            alert(error?.response?.data?.message || "Erreur lors de l'inscription");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-orange-500">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold">Créer un compte</CardTitle>
                    <CardDescription className="text-center text-gray-500">
                        Entrez vos informations pour rejoindre la marketplace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Type de compte avec logique de redirection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vous êtes ?</label>
                            <Select 
                                onValueChange={(value: any) => {
                                    setValue('role', value);
                                    // REDIRECTION AUTO SI PRO
                                    if (value === "vendeur") router.push("/vendor-subscription");
                                    if (value === "fournisseur") router.push("/supplier-subscription");
                                }} 
                                defaultValue="acheteur"
                            >
                                <SelectTrigger className="focus:ring-orange-500">
                                    <SelectValue placeholder="Choisir un rôle" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="acheteur">Acheteur (Client)</SelectItem>
                                    <SelectItem value="vendeur">Vendeur</SelectItem>
                                    <SelectItem value="fournisseur">Fournisseur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* On garde tes inputs originaux */}
                        <div className="space-y-1">
                            <Input {...register('fullName')} placeholder="Nom complet" className="focus:border-orange-500" />
                            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <Input {...register('email')} type="email" placeholder="Email" className="focus:border-orange-500" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <Input {...register('phone')} type="tel" placeholder="Téléphone (ex: 690...)" className="focus:border-orange-500" />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Input {...register('password')} type="password" placeholder="Mot de passe" className="focus:border-orange-500" />
                                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input {...register('confirmPassword')} type="password" placeholder="Confirmer" className="focus:border-orange-500" />
                                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <input type="checkbox" {...register('acceptTerms')} id="terms" className="rounded border-gray-300 accent-orange-500" />
                            <label htmlFor="terms" className="text-xs text-gray-600">
                                J'accepte les conditions d'utilisation
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}

                        <Button 
                            type="submit" 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Traitement..." : "Créer mon compte"}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Déjà inscrit ? <a href="/login" className="text-orange-600 font-bold hover:underline">Se connecter</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}