"use client";

import { useState, ChangeEvent, FormEvent } from "react";
// import Link from "next/link";


interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Formulaire envoyé :", formData);
    alert("Message envoyé avec succès !");
  };

  return (
    <>

      <main className="bg-gray-100 py-10 flex justify-center items-center min-h-[80vh]">
        <section className="bg-white rounded-lg shadow-md p-8 w-[90%] max-w-3xl">
          <h1 className="text-3xl font-semibold mb-4 text-center text-gray-800">
            Contactez-nous
          </h1>
          <p className="text-center text-gray-600 mb-6">
            N'hésitez pas à nous contacter pour toute question, suggestion ou
            problème. Nous sommes là pour vous aider !
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="block font-medium text-gray-700 mb-1"
              >
                Nom :
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-700 mb-1"
              >
                Adresse Email :
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block font-medium text-gray-700 mb-1"
              >
                Sujet :
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block font-medium text-gray-700 mb-1"
              >
                Message :
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition duration-300 font-semibold"
            >
              Envoyer
            </button>
          </form>

          <div className="mt-8 border-t pt-6 text-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-center">
              Informations de Contact
            </h3>
            <p className="text-center">Adresse : 123 Rue de l'Example, Ville, Pays</p>
            <p className="text-center">Téléphone : +1 555-123-4567</p>
            <p className="text-center">Email : contact@example.com</p>
          </div>
        </section>
      </main>

    </>
  );
}
