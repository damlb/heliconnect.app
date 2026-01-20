import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  CreditCard,
  Check,
  Star,
  Clock,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDateLong } from '@/lib/utils'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

interface ContextType {
  language: 'fr' | 'en'
}

interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', labelFr: 'Actif', labelEn: 'Active' },
  trialing: { color: 'bg-blue-100 text-blue-800', labelFr: 'Essai', labelEn: 'Trial' },
  cancelled: { color: 'bg-red-100 text-red-800', labelFr: 'Annulé', labelEn: 'Cancelled' },
  past_due: { color: 'bg-yellow-100 text-yellow-800', labelFr: 'Impayé', labelEn: 'Past Due' },
  expired: { color: 'bg-gray-100 text-gray-800', labelFr: 'Expiré', labelEn: 'Expired' },
}

export default function Subscription() {
  const { language } = useOutletContext<ContextType>()
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = (_planId: string) => {
    // TODO: Implement Stripe checkout
    alert(language === 'fr'
      ? 'Le paiement sera bientôt disponible. Contactez-nous pour souscrire.'
      : 'Payment will be available soon. Contact us to subscribe.'
    )
  }

  const handleCancelSubscription = async () => {
    if (!confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir annuler votre abonnement ?'
      : 'Are you sure you want to cancel your subscription?'
    )) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscription?.id)

      if (error) throw error
      fetchSubscription()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    }
  }

  const texts = {
    fr: {
      title: 'Mon abonnement',
      subtitle: 'Gérez votre abonnement HeliConnect',
      currentPlan: 'Plan actuel',
      noSubscription: 'Aucun abonnement actif',
      noSubscriptionDesc: 'Choisissez un plan pour accéder à toutes les fonctionnalités',
      choosePlan: 'Choisir ce plan',
      currentPlanBadge: 'Plan actuel',
      cancelSubscription: 'Annuler l\'abonnement',
      reactivate: 'Réactiver',
      nextBilling: 'Prochain paiement',
      endDate: 'Fin de l\'abonnement',
      cancelledAt: 'Sera annulé le',
      managePayment: 'Gérer le paiement',
      features: 'Fonctionnalités incluses',
      popular: 'Populaire',
      perMonth: '/mois',
      perYear: '/an',
      free: 'Gratuit',
      startTrial: 'Commencer l\'essai',
    },
    en: {
      title: 'My Subscription',
      subtitle: 'Manage your HeliConnect subscription',
      currentPlan: 'Current plan',
      noSubscription: 'No active subscription',
      noSubscriptionDesc: 'Choose a plan to access all features',
      choosePlan: 'Choose this plan',
      currentPlanBadge: 'Current plan',
      cancelSubscription: 'Cancel subscription',
      reactivate: 'Reactivate',
      nextBilling: 'Next billing',
      endDate: 'Subscription ends',
      cancelledAt: 'Will be cancelled on',
      managePayment: 'Manage payment',
      features: 'Included features',
      popular: 'Popular',
      perMonth: '/month',
      perYear: '/year',
      free: 'Free',
      startTrial: 'Start trial',
    },
  }

  const t = texts[language]

  const currentPlan = subscription
    ? SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_id)
    : null

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

      {/* Current subscription */}
      {subscription && subscription.status !== 'expired' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t.currentPlan}</CardTitle>
              <Badge className={statusConfig[subscription.status]?.color}>
                {language === 'fr'
                  ? statusConfig[subscription.status]?.labelFr
                  : statusConfig[subscription.status]?.labelEn
                }
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  {currentPlan ? (language === 'fr' ? currentPlan.name : currentPlan.nameEn) : subscription.plan_id}
                </h3>
                {currentPlan && (
                  <p className="text-gray-500 mt-1">
                    {currentPlan.price === 0
                      ? t.free
                      : `${formatPrice(currentPlan.price)}${language === 'fr' ? currentPlan.period : currentPlan.periodEn}`
                    }
                  </p>
                )}

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {subscription.cancel_at_period_end ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="h-4 w-4" />
                      <span>{t.cancelledAt} {formatDateLong(subscription.current_period_end)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{t.nextBilling}: {formatDateLong(subscription.current_period_end)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {subscription.stripe_subscription_id && (
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t.managePayment}
                  </Button>
                )}
                {!subscription.cancel_at_period_end && subscription.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleCancelSubscription}
                  >
                    {t.cancelSubscription}
                  </Button>
                )}
              </div>
            </div>

            {/* Features */}
            {currentPlan && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-500 mb-3">{t.features}</p>
                <ul className="space-y-2">
                  {(language === 'fr' ? currentPlan.features : currentPlan.featuresEn).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noSubscription}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noSubscriptionDesc}</p>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {subscription ? (language === 'fr' ? 'Changer de plan' : 'Change plan') : (language === 'fr' ? 'Choisir un plan' : 'Choose a plan')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id && subscription?.status !== 'expired'
            const isPopular = plan.id === 'monthly'

            return (
              <Card
                key={plan.id}
                className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-gray-50' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white">
                      <Star className="h-3 w-3 mr-1" />
                      {t.popular}
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-8">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">
                      {language === 'fr' ? plan.name : plan.nameEn}
                    </h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? t.free : `${plan.price}€`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">
                          {language === 'fr' ? plan.period : plan.periodEn}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {(language === 'fr' ? plan.features : plan.featuresEn).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        {t.currentPlanBadge}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${isPopular ? 'bg-primary' : ''}`}
                        variant={isPopular ? 'default' : 'outline'}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {plan.id === 'free_trial' ? t.startTrial : t.choosePlan}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
