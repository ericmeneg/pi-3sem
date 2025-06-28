import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />

      <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
        
        <div className="w-full max-w-4xl text-center bg-white bg-opacity-75 p-6 rounded-lg shadow-lg mb-10">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Localização de supermercados nas redondezas
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Este mapa exibe a localização de diferentes supermercados próximos da Fatec de Indaiatuba.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <img
            src="/images/mapamodificado.png"
            alt="Mapa de Indaiatuba"
            className="w-full max-w-5xl h-auto rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}