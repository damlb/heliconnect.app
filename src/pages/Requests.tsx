import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Send,
  Plus,
  MapPin,
  Calendar,
  Users,
  Trash2,
  Edit,
  Clock,
  Euro,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatDateLong } from '@/lib/utils'
import { POPULAR_CITIES, PASSENGER_OPTIONS, TIME_SLOTS } from '@/lib/constants'
import type { FlightRequest, FlightRequestStatus } from '@/types'

interface ContextType {
  language: 'fr' | 'en'
}

const statusColors: Record<FlightRequestStatus, string> = {
  active: 'bg-green-100 text-green-800',
  fulfilled: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<FlightRequestStatus, { fr: string; en: string }> = {
  active: { fr: 'Active', en: 'Active' },
  fulfilled: { fr: 'Satisfaite', en: 'Fulfilled' },
  expired: { fr: 'Expirée', en: 'Expired' },
  cancelled: { fr: 'Annulée', en: 'Cancelled' },
}

export default function Requests() {
  const { language } = useOutletContext<ContextType>()
  const { user } = useAuth()
  const [requests, setRequests] = useState<FlightRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<FlightRequest | null>(null)

  // Form state
  const [departureCity, setDepartureCity] = useState('')
  const [arrivalCity, setArrivalCity] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [dateFlexibility, setDateFlexibility] = useState('3')
  const [timeSlot, setTimeSlot] = useState('any')
  const [passengersCount, setPassengersCount] = useState('1')
  const [maxBudget, setMaxBudget] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setDepartureCity('')
    setArrivalCity('')
    setPreferredDate('')
    setDateFlexibility('3')
    setTimeSlot('any')
    setPassengersCount('1')
    setMaxBudget('')
    setNotes('')
    setEditingRequest(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (request: FlightRequest) => {
    setEditingRequest(request)
    setDepartureCity(request.departure_city)
    setArrivalCity(request.arrival_city)
    setPreferredDate(request.preferred_date.split('T')[0])
    setDateFlexibility(request.date_flexibility_days.toString())
    setTimeSlot(request.preferred_time_slot || 'any')
    setPassengersCount(request.passengers_count.toString())
    setMaxBudget(request.max_budget?.toString() || '')
    setNotes(request.notes || '')
    setIsModalOpen(true)
  }

  const handleSaveRequest = async () => {
    if (!departureCity || !arrivalCity || !preferredDate) {
      alert(language === 'fr'
        ? 'Veuillez remplir les champs obligatoires'
        : 'Please fill in the required fields'
      )
      return
    }

    try {
      const requestData = {
        user_id: user?.id,
        departure_city: departureCity,
        arrival_city: arrivalCity,
        preferred_date: preferredDate,
        date_flexibility_days: parseInt(dateFlexibility),
        preferred_time_slot: timeSlot === 'any' ? null : timeSlot,
        passengers_count: parseInt(passengersCount),
        max_budget: maxBudget ? parseFloat(maxBudget) : null,
        currency: 'EUR',
        notes: notes || null,
        status: 'active' as FlightRequestStatus,
        is_visible_to_companies: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }

      if (editingRequest) {
        const { error } = await supabase
          .from('flight_requests')
          .update(requestData)
          .eq('id', editingRequest.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('flight_requests')
          .insert(requestData)

        if (error) throw error
      }

      fetchRequests()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving request:', error)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir annuler cette demande ?'
      : 'Are you sure you want to cancel this request?'
    )) return

    try {
      const { error } = await supabase
        .from('flight_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error('Error cancelling request:', error)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir supprimer cette demande ?'
      : 'Are you sure you want to delete this request?'
    )) return

    try {
      const { error } = await supabase
        .from('flight_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const texts = {
    fr: {
      title: 'Demandes de vol',
      subtitle: 'Publiez vos demandes de vol et recevez des propositions',
      createRequest: 'Nouvelle demande',
      editRequest: 'Modifier la demande',
      noRequests: 'Aucune demande',
      noRequestsDesc: 'Créez une demande pour recevoir des propositions de vol',
      departure: 'Ville de départ *',
      arrival: 'Ville d\'arrivée *',
      preferredDate: 'Date souhaitée *',
      dateFlexibility: 'Flexibilité (jours)',
      timeSlot: 'Créneau horaire',
      passengers: 'Nombre de passagers',
      maxBudget: 'Budget maximum (€)',
      notes: 'Notes / Commentaires',
      notesPlaceholder: 'Informations supplémentaires pour les compagnies...',
      save: 'Publier la demande',
      update: 'Mettre à jour',
      cancel: 'Annuler',
      cancelRequest: 'Annuler la demande',
      delete: 'Supprimer',
      edit: 'Modifier',
      expiresOn: 'Expire le',
      flexibleDays: 'jours de flexibilité',
      passengersLabel: 'passagers',
      budgetMax: 'Budget max',
    },
    en: {
      title: 'Flight Requests',
      subtitle: 'Post your flight requests and receive proposals',
      createRequest: 'New request',
      editRequest: 'Edit request',
      noRequests: 'No requests',
      noRequestsDesc: 'Create a request to receive flight proposals',
      departure: 'Departure city *',
      arrival: 'Arrival city *',
      preferredDate: 'Preferred date *',
      dateFlexibility: 'Flexibility (days)',
      timeSlot: 'Time slot',
      passengers: 'Number of passengers',
      maxBudget: 'Maximum budget (€)',
      notes: 'Notes / Comments',
      notesPlaceholder: 'Additional information for operators...',
      save: 'Post request',
      update: 'Update',
      cancel: 'Cancel',
      cancelRequest: 'Cancel request',
      delete: 'Delete',
      edit: 'Edit',
      expiresOn: 'Expires on',
      flexibleDays: 'days flexibility',
      passengersLabel: 'passengers',
      budgetMax: 'Max budget',
    },
  }

  const t = texts[language]

  const timeSlotLabels = TIME_SLOTS.reduce((acc, slot) => {
    acc[slot.value] = language === 'fr' ? slot.label : slot.labelEn
    return acc
  }, {} as Record<string, string>)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-900">
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          {t.createRequest}
        </Button>
      </div>

      {/* Requests list */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noRequests}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noRequestsDesc}</p>
            <Button className="mt-4" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createRequest}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Request info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusColors[request.status]}>
                        {statusLabels[request.status][language]}
                      </Badge>
                      {request.expires_at && request.status === 'active' && (
                        <span className="text-xs text-gray-500">
                          {t.expiresOn} {formatDateLong(request.expires_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-xl font-semibold">
                          {request.departure_city} → {request.arrival_city}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateLong(request.preferred_date)}
                          {request.date_flexibility_days > 0 && (
                            <span className="ml-1">
                              (±{request.date_flexibility_days} {t.flexibleDays})
                            </span>
                          )}
                        </span>
                      </div>

                      {request.preferred_time_slot && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{timeSlotLabels[request.preferred_time_slot]}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{request.passengers_count} {t.passengersLabel}</span>
                      </div>

                      {request.max_budget && (
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          <span>{t.budgetMax}: {request.max_budget}€</span>
                        </div>
                      )}
                    </div>

                    {request.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        "{request.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {request.status === 'active' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    {['cancelled', 'expired'].includes(request.status) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRequest ? t.editRequest : t.createRequest}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Route */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.departure}</Label>
                <Input
                  placeholder="Paris, Nice..."
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  list="departure-cities"
                  required
                />
                <datalist id="departure-cities">
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>{t.arrival}</Label>
                <Input
                  placeholder="Monaco, Cannes..."
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  list="arrival-cities"
                  required
                />
                <datalist id="arrival-cities">
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Date and flexibility */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.preferredDate}</Label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{t.dateFlexibility}</Label>
                <Select value={dateFlexibility} onValueChange={setDateFlexibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 5, 7, 14].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        ±{days} {language === 'fr' ? 'jours' : 'days'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time slot */}
            <div>
              <Label>{t.timeSlot}</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {language === 'fr' ? slot.label : slot.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Passengers and budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.passengers}</Label>
                <Select value={passengersCount} onValueChange={setPassengersCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PASSENGER_OPTIONS.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.maxBudget}</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t.notes}</Label>
              <Textarea
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSaveRequest}>
              {editingRequest ? t.update : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
