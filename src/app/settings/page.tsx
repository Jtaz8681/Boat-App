'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, User, Bell, Map, Shield, LogOut, Save, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState({
    // Location settings
    locationInterval: 30,
    enableBackgroundTracking: true,
    enableHighAccuracy: true,
    
    // Notification settings
    enableNotifications: true,
    enableEmergencyAlerts: true,
    enableMaintenanceAlerts: true,
    enableWeatherAlerts: true,
    
    // Map settings
    mapStyle: 'openstreetmap',
    enableOfflineMaps: true,
    
    // Boat settings
    defaultFuelCapacity: 500,
    defaultFuelType: 'diesel',
    defaultEngineHours: 0,
    
    // Safety settings
    emergencyContacts: {
      coastGuard: '911',
      mechanic: '+1-555-0123',
      office: '+1-555-0456',
      medical: '911'
    }
  })

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('boatAppSettings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings(prev => ({ ...prev, ...parsed }))
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      }
    }
  }, [])

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('boatAppSettings', JSON.stringify(settings))
      }

      // Here you would also save to Supabase user preferences
      console.log('Settings saved:', settings)

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>User Profile</span>
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile?.role || 'captain'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  <span>Location Settings</span>
                </CardTitle>
                <CardDescription>Configure GPS tracking behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="locationInterval">Update Interval (seconds)</Label>
                  <select
                    id="locationInterval"
                    value={settings.locationInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, locationInterval: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 seconds (High accuracy)</option>
                    <option value={30}>30 seconds (Recommended)</option>
                    <option value={60}>60 seconds (Battery saver)</option>
                    <option value={120}>120 seconds (Maximum battery)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enableBackgroundTracking}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableBackgroundTracking: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Enable background tracking</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enableHighAccuracy}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableHighAccuracy: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">High accuracy GPS (uses more battery)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configure alert preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Enable notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableEmergencyAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableEmergencyAlerts: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Emergency alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableMaintenanceAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableMaintenanceAlerts: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Maintenance reminders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableWeatherAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableWeatherAlerts: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Weather warnings</span>
                </label>
              </CardContent>
            </Card>

            {/* Boat Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span>Boat Configuration</span>
                </CardTitle>
                <CardDescription>Default boat settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuelCapacity">Default Fuel Capacity (liters)</Label>
                    <Input
                      id="fuelCapacity"
                      type="number"
                      value={settings.defaultFuelCapacity}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultFuelCapacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelType">Default Fuel Type</Label>
                    <select
                      id="fuelType"
                      value={settings.defaultFuelType}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultFuelType: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="diesel">Diesel</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={saveSettings}
                  className="w-full"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/emergency">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    Emergency Center
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="coastGuard">Coast Guard</Label>
                  <Input
                    id="coastGuard"
                    value={settings.emergencyContacts.coastGuard}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emergencyContacts: { ...prev.emergencyContacts, coastGuard: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mechanic">Mechanic</Label>
                  <Input
                    id="mechanic"
                    value={settings.emergencyContacts.mechanic}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emergencyContacts: { ...prev.emergencyContacts, mechanic: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    value={settings.emergencyContacts.office}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emergencyContacts: { ...prev.emergencyContacts, office: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button
            onClick={saveSettings}
            size="lg"
            className="w-full"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving Settings...' : 'Save All Settings'}
          </Button>
        </div>
      </main>
    </div>
  )
}
