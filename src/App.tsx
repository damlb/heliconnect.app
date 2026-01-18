import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import Login from '@/pages/Login'
import Flights from '@/pages/Flights'
import './index.css'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

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

  return <>{children}</>
}

// Public route wrapper (redirects to flights if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
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
        <Route path="bookings" element={<ComingSoon title="Mes réservations" />} />
        <Route path="alerts" element={<ComingSoon title="Mes alertes" />} />
        <Route path="requests" element={<ComingSoon title="Demandes de vol" />} />
        <Route path="invoices" element={<ComingSoon title="Factures" />} />
        <Route path="subscription" element={<ComingSoon title="Mon abonnement" />} />
        <Route path="account" element={<ComingSoon title="Mon compte" />} />
      </Route>

      {/* Legal pages */}
      <Route path="/cgu" element={<LegalPage type="cgu" />} />
      <Route path="/cgv" element={<LegalPage type="cgv" />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/flights" replace />} />
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
