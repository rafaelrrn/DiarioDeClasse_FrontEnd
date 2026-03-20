import { PessoaDetalheClient } from './PessoaDetalheClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PessoaDetalhePage({ params }: Props) {
  const { id } = await params;
  return <PessoaDetalheClient idPessoa={Number(id)} />;
}
