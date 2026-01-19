import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Liste des domaines email personnels interdits
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'hotmail.fr',
  'outlook.com', 'outlook.fr', 'live.com', 'live.fr', 'msn.com',
  'aol.com', 'icloud.com', 'me.com', 'mail.com', 'protonmail.com',
  'gmx.com', 'gmx.fr', 'free.fr', 'orange.fr', 'sfr.fr', 'laposte.net',
  'wanadoo.fr', 'bbox.fr', 'numericable.fr'
]

const isBusinessEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return !BLOCKED_EMAIL_DOMAINS.includes(domain)
}

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [siret, setSiret] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      } else {
        navigate('/flights')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation email professionnel
    if (!isBusinessEmail(email)) {
      setError('Veuillez utiliser une adresse email professionnelle. Les adresses personnelles (Gmail, Hotmail, Yahoo, etc.) ne sont pas acceptées.')
      return
    }

    // Validation société obligatoire
    if (!companyName.trim()) {
      setError('Le nom de la société est obligatoire.')
      return
    }

    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone,
          company_name: companyName,
          siret,
          job_title: jobTitle,
          website,
          role: 'client',
          is_active: true,
        })

        if (profileError) throw profileError

        setRegistrationSuccess(true)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  // Composant Logo
  const LogoSection = ({ subtitle }: { subtitle: string }) => (
    <div className="text-center mb-8">
      <img
        src="/images/logo-white.svg"
        alt="HeliConnect"
        className="h-24 w-24 mx-auto mb-4"
      />
      <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        HeliConnect
      </h1>
      <p className="text-[#D4AF64]">{subtitle}</p>
    </div>
  )

  if (registrationSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Overlay bleu profond avec opacité */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D51]/95 via-[#1a365d]/90 to-[#2d4a7c]/95 z-10"></div>

        {/* Vidéo d'hélicoptère en arrière-plan */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover blur-sm"
          >
            <source src="/videos/helicopter-flight.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-md w-full relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Inscription réussie !
            </h2>
            <p className="text-gray-600 mb-6">
              Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
            </p>
            <button
              onClick={() => {
                setRegistrationSuccess(false)
                setActiveTab('login')
              }}
              className="w-full bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] py-3 px-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay bleu profond avec opacité */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D51]/95 via-[#1a365d]/90 to-[#2d4a7c]/95 z-10"></div>

      {/* Vidéo d'hélicoptère en arrière-plan */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover blur-sm"
        >
          <source src="/videos/helicopter-flight.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Contenu */}
      <div className="max-w-md w-full relative z-20">
        {/* Logo */}
        <LogoSection subtitle="Plateforme B2B - Vols à vide d'hélicoptères" />

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] shadow-sm'
                  : 'text-gray-600 hover:text-[#0B1D51]'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] shadow-sm'
                  : 'text-gray-600 hover:text-[#0B1D51]'
              }`}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1D51] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1D51] mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] py-3 px-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>

              <div className="text-center">
                <a href="#" className="text-sm text-[#D4AF64] hover:text-[#C99846] font-medium transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Bandeau B2B */}
              <div className="bg-[#0B1D51]/5 border border-[#0B1D51]/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-[#0B1D51] text-center font-medium">
                  🏢 Plateforme réservée aux professionnels du tourisme
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Email professionnel requis (pas de Gmail, Hotmail, etc.)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                  Société *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Agence Voyage Premium"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    placeholder="123 456 789 00012"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Directeur commercial"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                  Email professionnel *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom@votresociete.com"
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://votresociete.com"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1D51] mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors text-sm"
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] py-3 px-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Inscription...
                  </span>
                ) : (
                  "S'inscrire"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                En vous inscrivant, vous acceptez nos{' '}
                <Link to="/cgu" className="text-[#D4AF64] hover:text-[#C99846] font-medium transition-colors">
                  CGU
                </Link>{' '}
                et notre{' '}
                <Link to="/cgv" className="text-[#D4AF64] hover:text-[#C99846] font-medium transition-colors">
                  CGV
                </Link>
              </p>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="https://heliconnect.fr"
              className="text-sm text-gray-500 hover:text-[#D4AF64] transition-colors"
            >
              ← Retour au site
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200/80 text-sm mt-6">
          © {new Date().getFullYear()} HeliConnect. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
