import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  User,
  MapPin,
  Globe,
  Bell,
  Lock,
  Save,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
  onLanguageChange: (lang: 'fr' | 'en') => void
}

export default function Account() {
  const { language, onLanguageChange } = useOutletContext<ContextType>()
  const { user, profile, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Profile form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [siret, setSiret] = useState('')

  // Address form state
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('France')

  // Notifications settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPhone(profile.phone || '')
      setCompanyName(profile.company_name || '')
      setSiret(profile.siret || '')
      setEmailNotifications(profile.email_notifications)
      setPushNotifications(profile.push_notifications)

      if (profile.billing_address) {
        setStreet(profile.billing_address.street || '')
        setCity(profile.billing_address.city || '')
        setPostalCode(profile.billing_address.postal_code || '')
        setCountry(profile.billing_address.country || 'France')
      }
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          company_name: companyName || null,
          siret: siret || null,
          billing_address: {
            street,
            city,
            postal_code: postalCode,
            country,
          },
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          preferred_language: language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      setSuccessMessage(language === 'fr' ? 'Profil mis à jour' : 'Profile updated')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert(language === 'fr'
        ? 'Les mots de passe ne correspondent pas'
        : 'Passwords do not match'
      )
      return
    }

    if (newPassword.length < 6) {
      alert(language === 'fr'
        ? 'Le mot de passe doit contenir au moins 6 caractères'
        : 'Password must be at least 6 characters'
      )
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccessMessage(language === 'fr' ? 'Mot de passe modifié' : 'Password changed')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      alert(language === 'fr'
        ? 'Erreur lors du changement de mot de passe'
        : 'Error changing password'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const texts = {
    fr: {
      title: 'Mon compte',
      subtitle: 'Gérez vos informations personnelles',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      company: 'Société',
      siret: 'SIRET',
      address: 'Adresse de facturation',
      street: 'Adresse',
      city: 'Ville',
      postalCode: 'Code postal',
      country: 'Pays',
      language: 'Langue',
      save: 'Enregistrer',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      emailNotif: 'Notifications par email',
      emailNotifDesc: 'Recevoir des emails pour les nouveaux vols et mises à jour',
      pushNotif: 'Notifications push',
      pushNotifDesc: 'Recevoir des notifications push dans le navigateur',
      saved: 'Enregistré !',
    },
    en: {
      title: 'My Account',
      subtitle: 'Manage your personal information',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      siret: 'SIRET',
      address: 'Billing address',
      street: 'Street',
      city: 'City',
      postalCode: 'Postal code',
      country: 'Country',
      language: 'Language',
      save: 'Save',
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      emailNotif: 'Email notifications',
      emailNotifDesc: 'Receive emails for new flights and updates',
      pushNotif: 'Push notifications',
      pushNotifDesc: 'Receive push notifications in the browser',
      saved: 'Saved!',
    },
  }

  const t = texts[language]

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
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto flex">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none">
            <User className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.profile}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 sm:flex-none">
            <Bell className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.notifications}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 sm:flex-none">
            <Lock className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.security}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Avatar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-white text-xl">
                      {profile?.first_name && profile?.last_name
                        ? getInitials(`${profile.first_name} ${profile.last_name}`)
                        : 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-white border rounded-full shadow-sm hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.profile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t.firstName}</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t.lastName}</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>{t.email}</Label>
                <Input value={user?.email || ''} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>{t.phone}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t.company}</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t.siret}</Label>
                  <Input
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>
              <div>
                <Label>{t.language}</Label>
                <Select value={language} onValueChange={(v) => onLanguageChange(v as 'fr' | 'en')}>
                  <SelectTrigger>
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t.address}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.street}</Label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>{t.postalCode}</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t.city}</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>{t.country}</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Belgique">Belgique</SelectItem>
                    <SelectItem value="Suisse">Suisse</SelectItem>
                    <SelectItem value="Monaco">Monaco</SelectItem>
                    <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '...' : t.save}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.emailNotif}</p>
                  <p className="text-sm text-gray-500">{t.emailNotifDesc}</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.pushNotif}</p>
                  <p className="text-sm text-gray-500">{t.pushNotifDesc}</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '...' : t.save}
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.changePassword}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.currentPassword}</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label>{t.newPassword}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label>{t.confirmPassword}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleChangePassword}
              disabled={isSaving || !newPassword || !confirmPassword}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isSaving ? '...' : t.changePassword}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
