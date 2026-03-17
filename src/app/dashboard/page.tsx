'use client';

import { useAuth } from '@/contexts/AuthContext';


export default function Dashboard() {
  const { user, loading, logout } = useAuth();
 

  if (loading) {
    return <p>Carregando...</p>;
  }
 
  if (!user) {
    return <p>Usuário não autenticado</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>      

      <p>
        <strong>Nome:</strong> {user.nome}
      </p>

      <p>
        <strong>Perfil:</strong> {user.role}
       </p>
      
      <button onClick={logout} style={{ marginTop: 20 }}>
        Sair
      </button>
    </main>
  );
}

/*
import Protected from '@/components/Protected';

export default function Dashboard() {
  return (
    <Protected roles={['ADMINISTRADOR']}>
      <div>Conteúdo protegido</div>
    </Protected>
  );
}
*/