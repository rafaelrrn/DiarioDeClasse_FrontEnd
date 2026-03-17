'use client';

import styles from './page.module.css'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';


export default function LoginPage() {   
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    if (!email || !password) {
      alert('Preencha e-mail e senha');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/login', {
        email,
        senha: password,
      });

      await refreshUser();  

      // Se chegou aqui, o cookie foi setado com sucesso
      router.push('/dashboard');

    } catch (error) {
      alert('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={styles.page}>
      
      <section className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label htmlFor='email'>E-mail</label>
            <input
               id="email"
               type="email"
               onChange={(e) => setEmail(e.target.value)}
               placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
             />
          </div>

          <button className={styles.button} type="submit" disabled={loading}>
             {loading ? 'Entrando...' : 'Entrar'}
          </button>

        </form>        
      </section>
    </main>
  );
}
