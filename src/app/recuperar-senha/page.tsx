'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    if (!supabase) {
      setError('O serviço de autenticação não está disponível.')
      // Simular para desenvolvimento sem Supabase
      if (email === 'teste@teste.com') {
        setSuccessMessage('Simulação: Se uma conta existir para teste@teste.com, um email de redefinição foi enviado.')
      } else {
        setError('Simulação: Email não reconhecido para redefinição.')
      }
      setLoading(false)
      return
    }

    // Certifique-se de que a URL de redirecionamento está configurada no seu projeto Supabase
    // e que a página de atualização de senha existe.
    // Por exemplo: http://localhost:3000/atualizar-senha
    const redirectTo = `${window.location.origin}/atualizar-senha`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccessMessage('Se uma conta existir para este email, um link para redefinição de senha foi enviado.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
              Faça login
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
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
          {!successMessage && ( // Mostrar formulário apenas se não houver mensagem de sucesso
            <>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-pink-500 focus:outline-none focus:ring-pink-500 sm:text-sm"
                  placeholder="Seu endereço de email"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-pink-600 py-2 px-4 text-sm font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </div>
            </>
          )}
        </form>
         {successMessage && (
            <div className="text-center mt-4">
                <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                    Voltar para o Login
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}
