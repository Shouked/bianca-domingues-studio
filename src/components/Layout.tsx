'use client'

import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Home, 
  Users, 
  Calendar, 
  Receipt, 
  BarChart3,
  Package, // Ícone para Procedimentos
  Menu,
  X,
  LogOut
} from 'lucide-react'
import NotificationSettings from './NotificationSettings'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Procedimentos', href: '/procedimentos', icon: Package },
  { name: 'Despesas', href: '/despesas', icon: Receipt },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
]

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null) // Idealmente, use um tipo mais específico para o usuário
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        // Modo de simulação sem Supabase
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn && pathname !== '/login' && pathname !== '/cadastro') {
          router.push('/login')
        } else if (isLoggedIn && (pathname === '/login' || pathname === '/cadastro')) {
          router.push('/')
        }
        setLoadingAuth(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (!session?.user && pathname !== '/login' && pathname !== '/cadastro') {
        router.push('/login')
      } else if (session?.user && (pathname === '/login' || pathname === '/cadastro')) {
        // Se usuário logado tentar acessar /login ou /cadastro, redireciona para home
        router.push('/')
      }
      setLoadingAuth(false)
    }

    checkUser()

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_OUT' || (!session?.user && pathname !== '/login' && pathname !== '/cadastro')) {
          router.push('/login')
        } else if (event === 'SIGNED_IN' && (pathname === '/login' || pathname === '/cadastro')) {
          router.push('/')
        }
      })

      return () => {
        authListener?.subscription.unsubscribe()
      }
    }
  }, [pathname, router])

  const handleLogout = async () => {
    if (!supabase) {
      // Modo de simulação sem Supabase
      localStorage.removeItem('isLoggedIn')
      router.push('/login')
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
      </div>
    )
  }

  // Se for a página de login ou cadastro, não renderiza o layout principal
  if (pathname === '/login' || pathname === '/cadastro') {
    return <>{children}</>
  }
  
  // Se não estiver autenticado e não for página de login/cadastro (fallback, deve ser pego pelo useEffect)
  if (!user && !localStorage.getItem('isLoggedIn') && pathname !== '/login' && pathname !== '/cadastro') {
     // Este return pode ser um loader mais simples ou null, pois o useEffect já deve ter redirecionado
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p>Redirecionando para login...</p>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">Bianca Domingues</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-pink-100 text-pink-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">Bianca Domingues</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-pink-100 text-pink-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-lg font-semibold text-gray-900">Bianca Domingues</div>
          <div className="flex items-center gap-x-4">
            <NotificationSettings />
            {/* O botão de logout para mobile pode ser adicionado aqui se desejado, ou apenas no sidebar */}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex lg:h-16 lg:shrink-0 lg:items-center lg:justify-end lg:border-b lg:border-gray-200 lg:bg-white lg:px-6 lg:shadow-sm">
          <div className="flex items-center gap-x-4">
            <NotificationSettings />
            {/* O botão de logout para desktop já está no sidebar, mas poderia estar aqui também */}
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

