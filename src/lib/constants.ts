// Application constants for Client App

// Navigation items for client sidebar
export const SIDEBAR_ITEMS = [
  {
    id: 'flights',
    label: 'Rechercher des vols',
    labelEn: 'Search Flights',
    icon: 'Search',
    path: '/flights',
  },
  {
    id: 'bookings',
    label: 'Mes réservations',
    labelEn: 'My Bookings',
    icon: 'CalendarCheck',
    path: '/bookings',
  },
  {
    id: 'alerts',
    label: 'Mes alertes',
    labelEn: 'My Alerts',
    icon: 'Bell',
    path: '/alerts',
  },
  {
    id: 'requests',
    label: 'Demandes de vol',
    labelEn: 'Flight Requests',
    icon: 'Send',
    path: '/requests',
  },
  {
    id: 'invoices',
    label: 'Factures',
    labelEn: 'Invoices',
    icon: 'FileText',
    path: '/invoices',
  },
  {
    id: 'subscription',
    label: 'Mon abonnement',
    labelEn: 'My Subscription',
    icon: 'CreditCard',
    path: '/subscription',
  },
  {
    id: 'account',
    label: 'Mon compte',
    labelEn: 'My Account',
    icon: 'User',
    path: '/account',
  },
]

// Flight status options
export const FLIGHT_STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible', labelEn: 'Available' },
  { value: 'booked', label: 'Réservé', labelEn: 'Booked' },
]

// Booking status options
export const BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', labelEn: 'Pending' },
  { value: 'confirmed', label: 'Confirmé', labelEn: 'Confirmed' },
  { value: 'paid', label: 'Payé', labelEn: 'Paid' },
  { value: 'cancelled', label: 'Annulé', labelEn: 'Cancelled' },
  { value: 'completed', label: 'Terminé', labelEn: 'Completed' },
  { value: 'refunded', label: 'Remboursé', labelEn: 'Refunded' },
]

// Time slots for flight search
export const TIME_SLOTS = [
  { value: 'morning', label: 'Matin (6h-12h)', labelEn: 'Morning (6am-12pm)' },
  { value: 'afternoon', label: 'Après-midi (12h-18h)', labelEn: 'Afternoon (12pm-6pm)' },
  { value: 'evening', label: 'Soir (18h-22h)', labelEn: 'Evening (6pm-10pm)' },
  { value: 'any', label: 'Peu importe', labelEn: 'Any time' },
]

// Popular French cities for helicopters
export const POPULAR_CITIES = [
  'Paris',
  'Nice',
  'Cannes',
  'Monaco',
  'Saint-Tropez',
  'Marseille',
  'Lyon',
  'Bordeaux',
  'Toulouse',
  'Ajaccio',
  'Bastia',
  'Calvi',
  'Figari',
  'Porto-Vecchio',
  'Genève',
  'Milan',
  'Courchevel',
  'Megève',
  'Chamonix',
]

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free_trial',
    name: 'Essai gratuit',
    nameEn: 'Free Trial',
    price: 0,
    period: '30 jours',
    periodEn: '30 days',
    features: [
      'Accès aux vols empty legs',
      'Recherche et filtres',
      'Alertes email',
      'Support par email',
    ],
    featuresEn: [
      'Access to empty leg flights',
      'Search and filters',
      'Email alerts',
      'Email support',
    ],
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    nameEn: 'Monthly',
    price: 99,
    period: '/mois',
    periodEn: '/month',
    features: [
      'Accès prioritaire 48h',
      'Toutes les fonctionnalités',
      'Alertes instantanées',
      'Support prioritaire',
      'Demandes de vol',
    ],
    featuresEn: [
      '48h priority access',
      'All features',
      'Instant alerts',
      'Priority support',
      'Flight requests',
    ],
  },
  {
    id: 'yearly',
    name: 'Annuel',
    nameEn: 'Yearly',
    price: 990,
    period: '/an',
    periodEn: '/year',
    features: [
      'Économisez 2 mois',
      'Accès prioritaire 48h',
      'Toutes les fonctionnalités',
      'Support VIP',
      'Account manager dédié',
    ],
    featuresEn: [
      'Save 2 months',
      '48h priority access',
      'All features',
      'VIP support',
      'Dedicated account manager',
    ],
  },
]

// Passenger count options
export const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]
