import { notFound } from 'next/navigation';
import Image from 'next/image';
import receitas from './data/receitas';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ReceitaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReceitaPage({ params }: ReceitaPageProps) {
  const { slug } = await params;
  const receita = receitas.find(r => r.slug === slug);

  if (!receita) return notFound();

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-col items-center px-6 py-12 gap-8">
        <Image
          src="/images/fullLogo.svg"
          alt="Logo Cozinhaí"
          width={256}
          height={96}
          className="w-64 mb-6"
        />

        <h1 className="text-[#22577A] font-bold text-3xl text-center">🍽️ {receita.titulo}</h1>

        <Image
          src={receita.img}
          alt={receita.titulo}
          width={300}
          height={200}
          className="rounded-2xl border-2 border-[#22577A]"
        />

        <div className="text-[#22577A] text-lg font-medium w-full max-w-2xl flex flex-col gap-3">
          <p><strong>Serve:</strong> {receita.porcoes}</p>
          <p><strong>Modo de preparo:</strong> {receita.modo}</p>
          <p><strong>Tempo de preparo:</strong> {receita.tempo}</p>
        </div>

        <div className="w-full max-w-2xl">
          <h3 className="text-[#22577A] font-bold text-xl mt-6 mb-2">Ingredientes:</h3>
          <ul className="list-disc list-inside text-[#22577A] text-lg font-medium">
            {receita.ingredientes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="text-[#22577A] font-bold text-xl mt-6 mb-2">Modo de preparo:</h3>
          <p className="text-[#22577A] text-lg font-medium whitespace-pre-line">
            {receita.preparo}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
