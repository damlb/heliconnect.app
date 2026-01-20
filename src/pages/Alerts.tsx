import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Bell,
  Plus,
  MapPin,
  Calendar,
  Users,
  Trash2,
  Edit,
  BellOff,
  BellRing,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
import { POPULAR_CITIES, PASSENGER_OPTIONS } from '@/lib/constants'

interface ContextType {
  language: 'fr' | 'en'
}

interface FlightAlert {
  id: string
  user_id: string
  departure_city: string | null
  arrival_city: string | null
  date_from: string | null
  date_to: string | null
  min_seats: number
  max_price: number | null
  is_active: boolean
  notify_email: boolean
  notify_push: boolean
  created_at: string
  updated_at: string
}

export default function Alerts() {
  const { language } = useOutletContext<ContextType>()
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<FlightAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<FlightAlert | null>(null)

  // Form state
  const [departureCity, setDepartureCity] = useState('')
  const [arrivalCity, setArrivalCity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minSeats, setMinSeats] = useState('1')
  const [maxPrice, setMaxPrice] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setDepartureCity('')
    setArrivalCity('')
    setDateFrom('')
    setDateTo('')
    setMinSeats('1')
    setMaxPrice('')
    setNotifyEmail(true)
    setNotifyPush(false)
    setEditingAlert(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (alert: FlightAlert) => {
    setEditingAlert(alert)
    setDepartureCity(alert.departure_city || '')
    setArrivalCity(alert.arrival_city || '')
    setDateFrom(alert.date_from || '')
    setDateTo(alert.date_to || '')
    setMinSeats(alert.min_seats.toString())
    setMaxPrice(alert.max_price?.toString() || '')
    setNotifyEmail(alert.notify_email)
    setNotifyPush(alert.notify_push)
    setIsModalOpen(true)
  }

  const handleSaveAlert = async () => {
    try {
      const alertData = {
        user_id: user?.id,
        departure_city: departureCity || null,
        arrival_city: arrivalCity || null,
        date_from: dateFrom || null,
        date_to: dateTo || null,
        min_seats: parseInt(minSeats),
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        notify_email: notifyEmail,
        notify_push: notifyPush,
        is_active: true,
      }

      if (editingAlert) {
        const { error } = await supabase
          .from('flight_alerts')
          .update(alertData)
          .eq('id', editingAlert.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('flight_alerts')
          .insert(alertData)

        if (error) throw error
      }

      fetchAlerts()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving alert:', error)
    }
  }

  const handleToggleAlert = async (alert: FlightAlert) => {
    try {
      const { error } = await supabase
        .from('flight_alerts')
        .update({ is_active: !alert.is_active })
        .eq('id', alert.id)

      if (error) throw error
      fetchAlerts()
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir supprimer cette alerte ?'
      : 'Are you sure you want to delete this alert?'
    )) return

    try {
      const { error } = await supabase
        .from('flight_alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error
      fetchAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const texts = {
    fr: {
      title: 'Mes alertes',
      subtitle: 'Recevez des notifications pour les vols qui vous intéressent',
      createAlert: 'Créer une alerte',
      editAlert: 'Modifier l\'alerte',
      noAlerts: 'Aucune alerte',
      noAlertsDesc: 'Créez une alerte pour être notifié des nouveaux vols',
      departure: 'Ville de départ',
      arrival: 'Ville d\'arrivée',
      dateFrom: 'Date de début',
      dateTo: 'Date de fin',
      minSeats: 'Nombre de places minimum',
      maxPrice: 'Prix maximum (€)',
      notifications: 'Notifications',
      emailNotif: 'Par email',
      pushNotif: 'Notifications push',
      save: 'Enregistrer',
      cancel: 'Annuler',
      active: 'Active',
      inactive: 'Inactive',
      anyCity: 'Toutes les villes',
      anyDate: 'Toutes les dates',
      seats: 'places min.',
      maxPriceLabel: 'max',
      delete: 'Supprimer',
      edit: 'Modifier',
    },
    en: {
      title: 'My Alerts',
      subtitle: 'Get notifications for flights you\'re interested in',
      createAlert: 'Create alert',
      editAlert: 'Edit alert',
      noAlerts: 'No alerts',
      noAlertsDesc: 'Create an alert to be notified of new flights',
      departure: 'Departure city',
      arrival: 'Arrival city',
      dateFrom: 'Start date',
      dateTo: 'End date',
      minSeats: 'Minimum seats',
      maxPrice: 'Maximum price (€)',
      notifications: 'Notifications',
      emailNotif: 'By email',
      pushNotif: 'Push notifications',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      anyCity: 'Any city',
      anyDate: 'Any date',
      seats: 'seats min.',
      maxPriceLabel: 'max',
      delete: 'Delete',
      edit: 'Edit',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{t.subtitle}</p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t.createAlert}
        </Button>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noAlerts}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noAlertsDesc}</p>
            <Button className="mt-4" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createAlert}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`transition-opacity ${!alert.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Alert info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.is_active ? (
                        <BellRing className="h-5 w-5 text-primary" />
                      ) : (
                        <BellOff className="h-5 w-5 text-gray-400" />
                      )}
                      <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                        {alert.is_active ? t.active : t.inactive}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-xs md:text-sm">
                          {alert.departure_city || t.anyCity} → {alert.arrival_city || t.anyCity}
                        </span>
                      </div>

                      {(alert.date_from || alert.date_to) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-xs md:text-sm">
                            {alert.date_from ? formatDateLong(alert.date_from) : t.anyDate}
                            {alert.date_to && ` - ${formatDateLong(alert.date_to)}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs md:text-sm">{alert.min_seats} {t.seats}</span>
                      </div>

                      {alert.max_price && (
                        <Badge variant="outline" className="text-xs">
                          {alert.max_price}€ {t.maxPriceLabel}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      {alert.notify_email && <span>📧 Email</span>}
                      {alert.notify_push && <span>🔔 Push</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => handleToggleAlert(alert)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(alert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlert ? t.editAlert : t.createAlert}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.departure}</Label>
                <Input
                  placeholder={t.anyCity}
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  list="departure-cities"
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
                  placeholder={t.anyCity}
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  list="arrival-cities"
                />
                <datalist id="arrival-cities">
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.dateFrom}</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label>{t.dateTo}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Seats and price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.minSeats}</Label>
                <Select value={minSeats} onValueChange={setMinSeats}>
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
                <Label>{t.maxPrice}</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Notifications */}
            <div>
              <Label className="mb-2 block">{t.notifications}</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.emailNotif}</span>
                  <Switch
                    checked={notifyEmail}
                    onCheckedChange={setNotifyEmail}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.pushNotif}</span>
                  <Switch
                    checked={notifyPush}
                    onCheckedChange={setNotifyPush}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              {t.cancel}
            </Button>
            <Button onClick={handleSaveAlert} className="w-full sm:w-auto">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
