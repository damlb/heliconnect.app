import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Plane,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Eye,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import {
  formatPrice,
  formatDateTime,
  formatDateLong,
} from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

interface ContextType {
  language: 'fr' | 'en'
}

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
  refunded: 'bg-purple-100 text-purple-800',
}

const statusLabels: Record<BookingStatus, { fr: string; en: string }> = {
  pending: { fr: 'En attente', en: 'Pending' },
  confirmed: { fr: 'Confirmé', en: 'Confirmed' },
  paid: { fr: 'Payé', en: 'Paid' },
  cancelled: { fr: 'Annulé', en: 'Cancelled' },
  completed: { fr: 'Terminé', en: 'Completed' },
  refunded: { fr: 'Remboursé', en: 'Refunded' },
}

export default function Bookings() {
  const { language } = useOutletContext<ContextType>()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          flights (
            *,
            companies (name, logo_url),
            helicopters (model, registration)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailModalOpen(true)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir annuler cette réservation ?'
      : 'Are you sure you want to cancel this booking?'
    )) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by user'
        })
        .eq('id', bookingId)

      if (error) throw error

      // Refresh bookings
      fetchBookings()
      setIsDetailModalOpen(false)
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const upcomingBookings = bookings.filter(b =>
    ['pending', 'confirmed', 'paid'].includes(b.status) &&
    b.flight && new Date(b.flight.departure_datetime) > new Date()
  )

  const pastBookings = bookings.filter(b =>
    ['completed', 'cancelled', 'refunded'].includes(b.status) ||
    (b.flight && new Date(b.flight.departure_datetime) <= new Date())
  )

  const texts = {
    fr: {
      title: 'Mes réservations',
      subtitle: 'Gérez vos réservations de vols',
      upcoming: 'À venir',
      past: 'Passées',
      noBookings: 'Aucune réservation',
      noBookingsDesc: 'Vous n\'avez pas encore de réservation',
      searchFlights: 'Rechercher des vols',
      viewDetails: 'Voir les détails',
      cancel: 'Annuler',
      bookingRef: 'Réf.',
      passengers: 'passagers',
      totalPrice: 'Prix total',
      bookedOn: 'Réservé le',
      flightDetails: 'Détails du vol',
      bookingDetails: 'Détails de la réservation',
      contact: 'Contact',
      payment: 'Paiement',
      status: 'Statut',
      close: 'Fermer',
      cancelBooking: 'Annuler la réservation',
    },
    en: {
      title: 'My Bookings',
      subtitle: 'Manage your flight bookings',
      upcoming: 'Upcoming',
      past: 'Past',
      noBookings: 'No bookings',
      noBookingsDesc: 'You don\'t have any bookings yet',
      searchFlights: 'Search flights',
      viewDetails: 'View details',
      cancel: 'Cancel',
      bookingRef: 'Ref.',
      passengers: 'passengers',
      totalPrice: 'Total price',
      bookedOn: 'Booked on',
      flightDetails: 'Flight details',
      bookingDetails: 'Booking details',
      contact: 'Contact',
      payment: 'Payment',
      status: 'Status',
      close: 'Close',
      cancelBooking: 'Cancel booking',
    },
  }

  const t = texts[language]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const renderBookingCard = (booking: Booking) => {
    const flight = booking.flight as any

    return (
      <Card key={booking.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Flight info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[booking.status]}>
                  {statusLabels[booking.status][language]}
                </Badge>
                <span className="text-sm text-gray-500">
                  {t.bookingRef} {booking.booking_reference}
                </span>
              </div>

              {flight && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{flight.departure_city}</span>
                    <Plane className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{flight.arrival_city}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {flight && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateLong(flight.departure_datetime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{booking.seats_booked} {t.passengers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{t.bookedOn} {formatDateTime(booking.created_at).split(' ')[0]}</span>
                </div>
              </div>
            </div>

            {/* Price and actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.totalPrice}</p>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(booking.total_price)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(booking)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t.viewDetails}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-gray-900">
          {t.title}
        </h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            {t.upcoming} ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t.past} ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plane className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noBookings}</p>
                <p className="text-gray-400 text-sm mt-1">{t.noBookingsDesc}</p>
                <Button className="mt-4" asChild>
                  <a href="/flights">{t.searchFlights}</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noBookings}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.bookingDetails}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.bookingRef}</p>
                  <p className="font-mono font-semibold">{selectedBooking.booking_reference}</p>
                </div>
                <Badge className={statusColors[selectedBooking.status]}>
                  {statusLabels[selectedBooking.status][language]}
                </Badge>
              </div>

              {/* Flight info */}
              {selectedBooking.flight && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.flightDetails}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-semibold">
                          {(selectedBooking.flight as any).departure_city} → {(selectedBooking.flight as any).arrival_city}
                        </p>
                        <p className="text-gray-500">
                          {formatDateLong((selectedBooking.flight as any).departure_datetime)} à {formatDateTime((selectedBooking.flight as any).departure_datetime).split(' ')[1]}
                        </p>
                      </div>
                      {(selectedBooking.flight as any).companies?.name && (
                        <Badge variant="secondary">
                          {(selectedBooking.flight as any).companies.name}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Booking details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t.passengers}</p>
                  <p className="font-semibold">{selectedBooking.seats_booked}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.totalPrice}</p>
                  <p className="font-semibold text-primary">{formatPrice(selectedBooking.total_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.contact}</p>
                  <p className="font-semibold">{selectedBooking.contact_name}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.bookedOn}</p>
                  <p className="font-semibold">{formatDateLong(selectedBooking.created_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t.cancelBooking}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  {t.close}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
