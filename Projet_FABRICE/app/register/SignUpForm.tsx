'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { authService } from "../../services/auth.service"; // Vérifie bien le chemin

import { Button } from "../componets/ui/button";
import { Input } from "../componets/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componets/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../componets/ui/select";

// Schema strict correspondant à ton Backend Laravel
const signUpSchema = z.object({
    fullName: z.string().min(2, 'Le nom est trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(9, 'Numéro invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
    role: z.enum(['acheteur', 'vendeur']),
    acceptTerms: z.boolean().refine(val => val === true, 'Obligatoire'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
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
            // Payload exact pour Laravel
            const payload = {
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.confirmPassword,
                role: data.role
            };

            await authService.register(payload);
            alert("Compte créé ! Connectez-vous.");
            router.push('/login');
        } catch (error: any) {
            console.error('Erreur:', error?.response?.data || error);
            alert(error?.response?.data?.message || "Erreur lors de l'inscription");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold">Créer un compte</CardTitle>
                    <CardDescription className="text-center">
                        Entrez vos informations pour rejoindre la marketplace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Type de compte */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vous êtes ?</label>
                            <Select onValueChange={(value: any) => setValue('role', value)} defaultValue="acheteur">
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="acheteur">Acheteur (Client)</SelectItem>
                                    <SelectItem value="vendeur">Vendeur (Fournisseur)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nom Complet */}
                        <div className="space-y-1">
                            <Input {...register('fullName')} placeholder="Nom complet" />
                            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <Input {...register('email')} type="email" placeholder="Email" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Téléphone */}
                        <div className="space-y-1">
                            <Input {...register('phone')} type="tel" placeholder="Téléphone (ex: 690...)" />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        {/* Mots de passe */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Input {...register('password')} type="password" placeholder="Mot de passe" />
                                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input {...register('confirmPassword')} type="password" placeholder="Confirmer" />
                                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center space-x-2 py-2">
                            <input type="checkbox" {...register('acceptTerms')} id="terms" className="rounded border-gray-300" />
                            <label htmlFor="terms" className="text-xs text-gray-600">
                                J'accepte les conditions d'utilisation
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                            {isSubmitting ? "Traitement..." : "Créer mon compte"}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Déjà inscrit ? <a href="/login" className="text-blue-600 hover:underline">Se connecter</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}