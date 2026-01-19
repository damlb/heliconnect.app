import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import Login from '@/pages/Login'
import Flights from '@/pages/Flights'
import Bookings from '@/pages/Bookings'
import Alerts from '@/pages/Alerts'
import Requests from '@/pages/Requests'
import Invoices from '@/pages/Invoices'
import Subscription from '@/pages/Subscription'
import Account from '@/pages/Account'
import './index.css'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Vérifier que l'utilisateur a le rôle client ou superadmin
  if (profile && profile.role !== 'client' && profile.role !== 'superadmin') {
    // Rediriger vers le site principal
    window.location.href = 'https://heliconnect.fr'
    return null
  }

  return <>{children}</>
}

// Public route wrapper (redirects to flights if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth()

  // Ne pas attendre le loading pour afficher la page login
  // Mais attendre que le profile soit chargé avant de rediriger
  if (!isLoading && isAuthenticated && profile) {
    return <Navigate to="/flights" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/flights" replace />} />
        <Route path="flights" element={<Flights />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="requests" element={<Requests />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="account" element={<Account />} />
      </Route>

      {/* Legal pages */}
      <Route path="/cgu" element={<LegalPage type="cgu" />} />
      <Route path="/cgv" element={<LegalPage type="cgv" />} />

      {/* Catch all - redirect to login (ProtectedRoute will handle redirect if authenticated) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// Placeholder component for pages not yet implemented
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-2xl font-display font-semibold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-500">Cette page est en cours de développement</p>
    </div>
  )
}

// Legal pages placeholder
function LegalPage({ type }: { type: 'cgu' | 'cgv' }) {
  const title = type === 'cgu' ? "Conditions Générales d'Utilisation" : "Conditions Générales de Vente"

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-display font-semibold text-gray-900 mb-6">
          {title}
        </h1>
        <p className="text-gray-500">
          Les conditions générales seront bientôt disponibles.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-primary hover:underline"
        >
          ← Retour
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
