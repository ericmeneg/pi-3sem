'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Error({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Erro ao carregar a receita:', error);
  }, [error]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center text-[#22577A]">
        <h1 className="text-2xl font-bold mb-4">{"Algo deu errado ao carregar a receita :("}</h1>
        <p className="mb-6">Por favor, tente novamente ou volte para a página anterior.</p>
        <Link
          href="/receitas"
          className="bg-gradient-to-t from-[#22577A] to-[#57CC99] px-6 py-2 rounded-full shadow-md text-white hover:brightness-110 transition"
        >
          Voltar para as receitas
        </Link>
      </main>

      <Footer />
    </div>
  );
}
