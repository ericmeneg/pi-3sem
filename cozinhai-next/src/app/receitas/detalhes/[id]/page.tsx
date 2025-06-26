import ClientPageContent from './ClientPageContent';


interface ReceitaDetalhesPageServerProps {
  params: Promise<{ id: string }>;
}


export default async function ReceitaDetalhesPage({ params }: ReceitaDetalhesPageServerProps) {
  const { id: idReceita } = await params;
  return (
    <ClientPageContent idReceita={idReceita} />
  );
}