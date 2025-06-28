"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Botao from "@/components/Botao";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type Recipe = {
  id: number;
  title: string;
  image: string;
};

// Renomeamos o componente principal para 'RecipeResultsContent'
// Este componente contém a lógica que usa useSearchParams
function RecipeResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY!;

      if (!apiKey) {
        setError("Erro: A chave da API Spoonacular não está configurada.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
            query
          )}&apiKey=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar as receitas (Status: ${response.status})`);
        }

        const data = await response.json();
        setRecipes(data.results);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen flex text-center items-center justify-around max-w-4xl mx-auto">
        <div>
          <h1
            className="mb-[1rem]"
            style={{ fontSize: "2rem", color: "#2EC4B6" }}
          >
            Digite o nome da receita desejada na barra de pesquisa
          </h1>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 pt-18">
      <div className="max-w-4xl mx-auto">
        <h1
          className="mb-[1rem] mt-[5rem]"
          style={{ fontSize: "3.246rem", color: "#2EC4B6" }}
        >
          Resultados para &quot;{query}&quot;
        </h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border-2 border-[#22577A] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#22577A] mb-4">
                    {recipe.title}
                  </h3>
                  <Botao texto="Ver receita" destino={`/receitas/detalhes/${recipe.id}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {recipes.length === 0 && !loading && !error && (
        <p>Nenhuma receita encontrada.</p>
      )}
    </main>
  );
}

export default function RecipeResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div>Carregando resultados da busca...</div>}>
        <RecipeResultsContent />
      </Suspense>
    </div>
  );
}