'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null) // null = verificando, true = válido, false = inválido/expirado

  // O token de acesso (hash) é geralmente parte da URL após #, não em searchParams.
  // Precisamos lê-lo do fragmento do hash no lado do cliente.
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1)) // Remove #
    const accessToken = params.get('access_token')
    const errorParam = params.get('error')
    const errorCode = params.get('error_code')
    const errorDescription = params.get('error_description')


    if (errorParam) {
        console.error("Erro no token de atualização de senha:", errorDescription);
        setError(`Erro ao processar link: ${errorDescription || errorParam} (Código: ${errorCode})`);
        setIsValidToken(false);
        return;
    }

    if (!accessToken) {
      // Se não houver token de acesso na URL, pode ser que o usuário esteja vindo de um SIGNED_IN após o signUp.
      // Ou o link é inválido/expirado.
      // Vamos verificar se há uma sessão ativa, o que acontece após o link de confirmação de email.
      // O link de recuperação de senha do Supabase geralmente inclui o type=recovery no hash.
      const type = params.get('type');
      if (type === 'recovery') {
         // Se for 'recovery' e não tiver accessToken, o link provavelmente está malformado ou já foi usado.
         // No entanto, o Supabase lida com isso no `updateUser`.
      }
      // Não definimos isValidToken como false imediatamente, pois updateUser pode funcionar se houver sessão.
    } else {
        // Se há um access_token, é provável que seja um link de recuperação.
        // Não há necessidade de verificar explicitamente o token aqui, 
        // supabase.auth.updateUser fará isso.
    }

    // Tratamento para o evento de login via link mágico (PKCE)
    // Se o usuário acabou de confirmar o email ou resetar a senha, o Supabase pode ter criado uma sessão.
    // O evento onAuthStateChange no Layout.tsx deve lidar com o redirecionamento se uma sessão for estabelecida.
    // Aqui, apenas preparamos para a atualização da senha.
    
    // Para a página de atualização de senha, o usuário precisa estar autenticado por meio do link.
    // O Supabase trata isso automaticamente ao redirecionar. Se o usuário chegar aqui,
    // o `updateUser` abaixo tentará usar a sessão estabelecida pelo link.
    setIsValidToken(true); // Assume que se chegou aqui, o Supabase gerenciou o token. O erro aparecerá no submit.

  }, [])


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        return
    }

    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    if (!supabase) {
      setError('O serviço de autenticação não está disponível.')
      setLoading(false)
      return
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError(`Erro ao atualizar senha: ${updateError.message}. O link pode ter expirado ou ser inválido.`)
    } else {
      setSuccessMessage('Senha atualizada com sucesso! Você já pode fazer login com sua nova senha.')
      // Opcional: deslogar o usuário para forçar novo login com a nova senha
      // await supabase.auth.signOut(); 
      // router.push('/login'); // Redirecionar após um pequeno delay ou na mensagem de sucesso
    }
    setLoading(false)
  }
  
  if (isValidToken === null && !error) { // Adicionado !error para não mostrar loader se já deu erro no token
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <p className="ml-3 text-gray-700">Verificando link...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Atualizar Senha
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {!successMessage && isValidToken && ( // Mostrar formulário apenas se não houver sucesso e token parecer válido
            <>
              <div>
                <label htmlFor="password" className="sr-only">
                  Nova Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-pink-500 focus:outline-none focus:ring-pink-500 sm:text-sm"
                  placeholder="Nova Senha (mínimo 6 caracteres)"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-pink-500 focus:outline-none focus:ring-pink-500 sm:text-sm"
                  placeholder="Confirmar Nova Senha"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-pink-600 py-2 px-4 text-sm font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </>
          )}
        </form>
        {(successMessage || !isValidToken) && ( // Mostrar link de login se sucesso ou token inválido
             <div className="text-center mt-4">
                <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                    Ir para Login
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}
