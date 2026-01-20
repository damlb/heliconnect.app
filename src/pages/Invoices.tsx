import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDateLong } from '@/lib/utils'
import type { Invoice } from '@/types'

interface ContextType {
  language: 'fr' | 'en'
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    labelFr: 'En attente',
    labelEn: 'Pending',
  },
  paid: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    labelFr: 'Payée',
    labelEn: 'Paid',
  },
  overdue: {
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
    labelFr: 'En retard',
    labelEn: 'Overdue',
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    labelFr: 'Annulée',
    labelEn: 'Cancelled',
  },
}

export default function Invoices() {
  const { language } = useOutletContext<ContextType>()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchInvoices()
    }
  }, [user])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          bookings (
            booking_reference,
            flights (
              departure_city,
              arrival_city,
              departure_datetime
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailModalOpen(true)
  }

  const handleDownloadPdf = (invoice: Invoice) => {
    if (invoice.pdf_url || invoice.stripe_invoice_pdf) {
      window.open(invoice.pdf_url || invoice.stripe_invoice_pdf || '', '_blank')
    }
  }

  const texts = {
    fr: {
      title: 'Factures',
      subtitle: 'Consultez et téléchargez vos factures',
      noInvoices: 'Aucune facture',
      noInvoicesDesc: 'Vos factures apparaîtront ici après vos réservations',
      invoiceNumber: 'N° Facture',
      date: 'Date',
      description: 'Description',
      amount: 'Montant',
      status: 'Statut',
      actions: 'Actions',
      view: 'Voir',
      download: 'Télécharger',
      invoiceDetails: 'Détails de la facture',
      lineItems: 'Lignes de facture',
      subtotal: 'Sous-total',
      tax: 'TVA',
      total: 'Total',
      dueDate: 'Date d\'échéance',
      paidAt: 'Payée le',
      close: 'Fermer',
      booking: 'Réservation',
      subscription: 'Abonnement',
      flight: 'Vol',
      openStripe: 'Voir sur Stripe',
    },
    en: {
      title: 'Invoices',
      subtitle: 'View and download your invoices',
      noInvoices: 'No invoices',
      noInvoicesDesc: 'Your invoices will appear here after your bookings',
      invoiceNumber: 'Invoice #',
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      download: 'Download',
      invoiceDetails: 'Invoice Details',
      lineItems: 'Line Items',
      subtotal: 'Subtotal',
      tax: 'VAT',
      total: 'Total',
      dueDate: 'Due date',
      paidAt: 'Paid on',
      close: 'Close',
      booking: 'Booking',
      subscription: 'Subscription',
      flight: 'Flight',
      openStripe: 'View on Stripe',
    },
  }

  const t = texts[language]

  const getInvoiceDescription = (invoice: Invoice) => {
    if (invoice.type === 'subscription') {
      return language === 'fr' ? 'Abonnement HeliConnect' : 'HeliConnect Subscription'
    }
    if (invoice.type === 'booking' && (invoice as any).bookings?.flights) {
      const flight = (invoice as any).bookings.flights
      return `${t.flight}: ${flight.departure_city} → ${flight.arrival_city}`
    }
    return invoice.type === 'booking' ? t.booking : t.subscription
  }

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

      {/* Invoices list */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noInvoices}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noInvoicesDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.invoiceNumber}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead>{t.description}</TableHead>
                  <TableHead className="text-right">{t.amount}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig]
                  const StatusIcon = status?.icon || FileText

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        {formatDateLong(invoice.created_at)}
                      </TableCell>
                      <TableCell>
                        {getInvoiceDescription(invoice)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(invoice.total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={status?.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {language === 'fr' ? status?.labelFr : status?.labelEn}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(invoice.pdf_url || invoice.stripe_invoice_pdf) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPdf(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.invoiceDetails}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.invoiceNumber}</p>
                  <p className="font-mono font-semibold text-lg">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
                <Badge className={statusConfig[selectedInvoice.status as keyof typeof statusConfig]?.color}>
                  {language === 'fr'
                    ? statusConfig[selectedInvoice.status as keyof typeof statusConfig]?.labelFr
                    : statusConfig[selectedInvoice.status as keyof typeof statusConfig]?.labelEn
                  }
                </Badge>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t.date}</p>
                  <p className="font-medium">{formatDateLong(selectedInvoice.created_at)}</p>
                </div>
                {selectedInvoice.due_date && (
                  <div>
                    <p className="text-sm text-gray-500">{t.dueDate}</p>
                    <p className="font-medium">{formatDateLong(selectedInvoice.due_date)}</p>
                  </div>
                )}
                {selectedInvoice.paid_at && (
                  <div>
                    <p className="text-sm text-gray-500">{t.paidAt}</p>
                    <p className="font-medium">{formatDateLong(selectedInvoice.paid_at)}</p>
                  </div>
                )}
              </div>

              {/* Line items */}
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t.lineItems}</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.description}</TableHead>
                          <TableHead className="text-right">Qté</TableHead>
                          <TableHead className="text-right">Prix unit.</TableHead>
                          <TableHead className="text-right">{t.total}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.line_items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.subtotal}</span>
                  <span>{formatPrice(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.tax} ({selectedInvoice.tax_rate}%)</span>
                    <span>{formatPrice(selectedInvoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.total}</span>
                  <span className="text-primary">{formatPrice(selectedInvoice.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedInvoice.stripe_invoice_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedInvoice.stripe_invoice_url || '', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.openStripe}
                  </Button>
                )}
                {(selectedInvoice.pdf_url || selectedInvoice.stripe_invoice_pdf) && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadPdf(selectedInvoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t.download}
                  </Button>
                )}
                <Button onClick={() => setIsDetailModalOpen(false)}>
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
