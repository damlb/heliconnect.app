import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Search,
  Plane,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import {
  formatPrice,
  formatDateTime,
  formatDuration,
  formatDateLong,
} from '@/lib/utils'
import type { Flight } from '@/types'
import { POPULAR_CITIES, PASSENGER_OPTIONS } from '@/lib/constants'

interface ContextType {
  language: 'fr' | 'en'
}

export default function Flights() {
  const { language } = useOutletContext<ContextType>()
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Search filters
  const [departureCity, setDepartureCity] = useState('')
  const [arrivalCity, setArrivalCity] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Booking modal
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    fetchFlights()
  }, [])

  useEffect(() => {
    filterFlights()
  }, [flights, departureCity, arrivalCity, departureDate, passengers, maxPrice])

  const fetchFlights = async () => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*, companies(name, logo_url), helicopters(model, registration, passenger_capacity)')
        .eq('status', 'available')
        .eq('is_visible_to_public', true)
        .gte('departure_datetime', new Date().toISOString())
        .order('departure_datetime', { ascending: true })

      if (error) throw error
      setFlights(data || [])
    } catch (error) {
      console.error('Error fetching flights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFlights = () => {
    let filtered = flights

    // Filter by departure city
    if (departureCity) {
      filtered = filtered.filter((f) =>
        f.departure_city.toLowerCase().includes(departureCity.toLowerCase())
      )
    }

    // Filter by arrival city
    if (arrivalCity) {
      filtered = filtered.filter((f) =>
        f.arrival_city.toLowerCase().includes(arrivalCity.toLowerCase())
      )
    }

    // Filter by date
    if (departureDate) {
      filtered = filtered.filter((f) => {
        const flightDate = new Date(f.departure_datetime).toDateString()
        const searchDate = new Date(departureDate).toDateString()
        return flightDate === searchDate
      })
    }

    // Filter by passengers
    const passengerCount = parseInt(passengers)
    filtered = filtered.filter(
      (f) => f.available_seats - f.booked_seats >= passengerCount
    )

    // Filter by max price
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      filtered = filtered.filter(
        (f) => (f.price_per_seat || 0) <= max || (f.total_price || 0) <= max
      )
    }

    setFilteredFlights(filtered)
  }

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setIsBookingModalOpen(true)
  }

  const texts = {
    fr: {
      title: 'Rechercher des vols',
      subtitle: 'Trouvez votre prochain vol empty leg en hélicoptère',
      departure: 'Départ',
      arrival: 'Arrivée',
      date: 'Date',
      passengers: 'Passagers',
      search: 'Rechercher',
      filters: 'Filtres',
      maxPrice: 'Prix max',
      noFlights: 'Aucun vol trouvé',
      noFlightsDesc: 'Essayez de modifier vos critères de recherche',
      results: 'résultats',
      book: 'Réserver',
      seats: 'places',
      available: 'disponibles',
      from: 'À partir de',
      perSeat: '/ place',
      duration: 'Durée',
      company: 'Compagnie',
      helicopter: 'Hélicoptère',
    },
    en: {
      title: 'Search Flights',
      subtitle: 'Find your next empty leg helicopter flight',
      departure: 'Departure',
      arrival: 'Arrival',
      date: 'Date',
      passengers: 'Passengers',
      search: 'Search',
      filters: 'Filters',
      maxPrice: 'Max price',
      noFlights: 'No flights found',
      noFlightsDesc: 'Try modifying your search criteria',
      results: 'results',
      book: 'Book',
      seats: 'seats',
      available: 'available',
      from: 'From',
      perSeat: '/ seat',
      duration: 'Duration',
      company: 'Company',
      helicopter: 'Helicopter',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-gray-900">
          {t.title}
        </h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Search bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Departure */}
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">{t.departure}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Paris, Nice..."
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="pl-10"
                list="departure-cities"
              />
              <datalist id="departure-cities">
                {POPULAR_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Arrival */}
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">{t.arrival}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Monaco, Cannes..."
                value={arrivalCity}
                onChange={(e) => setArrivalCity(e.target.value)}
                className="pl-10"
                list="arrival-cities"
              />
              <datalist id="arrival-cities">
                {POPULAR_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">{t.date}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Passengers */}
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">{t.passengers}</Label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PASSENGER_OPTIONS.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'passager' : 'passagers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search button */}
          <div className="flex items-end gap-2">
            <Button className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              {t.search}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t.maxPrice} (€)</Label>
              <Input
                type="number"
                placeholder="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredFlights.length} {t.results}
        </p>
      </div>

      {/* Flights list */}
      {filteredFlights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noFlights}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noFlightsDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFlights.map((flight) => (
            <Card
              key={flight.id}
              className="hover:shadow-lg transition-shadow overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Main flight info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-6">
                      {/* Route */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {flight.departure_city}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(flight.departure_datetime).split(' ')[1]}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-12 h-px bg-gray-300" />
                          <Plane className="h-5 w-5" />
                          <div className="w-12 h-px bg-gray-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {flight.arrival_city}
                          </p>
                          {flight.flight_duration_minutes && (
                            <p className="text-sm text-gray-500">
                              {formatDuration(flight.flight_duration_minutes)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateLong(flight.departure_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {flight.available_seats - flight.booked_seats} {t.seats} {t.available}
                        </span>
                      </div>
                      {(flight as any).companies?.name && (
                        <Badge variant="secondary">
                          {(flight as any).companies.name}
                        </Badge>
                      )}
                      {(flight as any).helicopters?.model && (
                        <Badge variant="outline">
                          {(flight as any).helicopters.model}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price and book */}
                  <div className="bg-gray-50 p-6 flex flex-col items-center justify-center border-l min-w-[200px]">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">{t.from}</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(flight.price_per_seat || flight.total_price)}
                      </p>
                      {flight.price_per_seat && (
                        <p className="text-sm text-gray-500">{t.perSeat}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleBookFlight(flight)}
                    >
                      {t.book}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Réserver ce vol' : 'Book this flight'}
            </DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedFlight.departure_city} → {selectedFlight.arrival_city}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateLong(selectedFlight.departure_datetime)} à{' '}
                      {formatDateTime(selectedFlight.departure_datetime).split(' ')[1]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(selectedFlight.price_per_seat || selectedFlight.total_price)}
                    </p>
                    {selectedFlight.price_per_seat && (
                      <p className="text-sm text-gray-500">{t.perSeat}</p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                {language === 'fr'
                  ? 'La fonctionnalité de réservation sera bientôt disponible. Contactez-nous pour réserver ce vol.'
                  : 'The booking feature will be available soon. Contact us to book this flight.'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
            <Button>
              {language === 'fr' ? 'Nous contacter' : 'Contact us'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
