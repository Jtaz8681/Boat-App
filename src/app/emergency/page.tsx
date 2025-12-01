'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGPS } from '@/hooks/useGPS'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Ship, 
  Radio,
  Navigation,
  Anchor,
  Heart,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface EmergencyContact {
  name: string
  phone: string
  type: 'coast_guard' | 'mechanic' | 'office' | 'medical'
}

export default function EmergencyPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { position, getCurrentPosition } = useGPS({
    watchInterval: 10000,
    enableHighAccuracy: true,
    enableBackgroundTracking: true,
  })

  const [isSOSActive, setIsSOSActive] = useState(false)
  const [emergencyType, setEmergencyType] = useState<string | null>(null)
  const [messageSent, setMessageSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Mock emergency contacts
  const emergencyContacts: EmergencyContact[] = [
    {
      name: 'Coast Guard',
      phone: '911',
      type: 'coast_guard'
    },
    {
      name: 'Marine Mechanic',
      phone: '+1-555-0123',
      type: 'mechanic'
    },
    {
      name: 'Office',
      phone: '+1-555-0456',
      type: 'office'
    },
    {
      name: 'Medical Emergency',
      phone: '911',
      type: 'medical'
    }
  ]

  // Get current location on mount
  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  // Handle SOS countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSOSActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && isSOSActive) {
      triggerSOS()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSOSActive, countdown])

  // Handle emergency type selection
  const handleEmergencyType = (type: string) => {
    setEmergencyType(type)
  }

  // Start SOS countdown
  const startSOS = () => {
    setIsSOSActive(true)
    setCountdown(5) // 5 second countdown
  }

  // Cancel SOS
  const cancelSOS = () => {
    setIsSOSActive(false)
    setCountdown(0)
    setEmergencyType(null)
  }

  // Trigger actual SOS
  const triggerSOS = async () => {
    try {
      const sosData = {
        user_id: user?.id,
        emergency_type: emergencyType,
        location: position ? {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
        } : null,
        timestamp: new Date().toISOString(),
        boat_info: {
          name: 'Sea Explorer', // Mock data
          registration: 'SEA-123'
        }
      }

      // Send SOS notification (mock for now)
      console.log('SOS TRIGGERED:', sosData)
      
      // Call emergency services
      window.location.href = 'tel:911'
      
      setMessageSent(true)
      setIsSOSActive(false)
      setCountdown(0)
    } catch (error) {
      console.error('Error triggering SOS:', error)
      cancelSOS()
    }
  }

  // Make emergency call
  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`
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
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold">Emergency Center</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Exit Emergency
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Status */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <MapPin className="h-5 w-5" />
              <span>Current Location</span>
            </CardTitle>
            <CardDescription>
              {position 
                ? `Lat: ${position.latitude.toFixed(6)}, Lon: ${position.longitude.toFixed(6)} (±${position.accuracy.toFixed(0)}m)`
                : 'Getting location...'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              {position ? (
                <>
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">GPS Active</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-800 font-medium">Acquiring GPS...</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Type Selection */}
        {!isSOSActive && !messageSent && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What type of emergency?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleEmergencyType('man_overboard')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <Users className="h-8 w-8" />
                <span className="text-sm">Man Overboard</span>
              </Button>
              
              <Button
                onClick={() => handleEmergencyType('fire')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <div className="h-8 w-8 bg-orange-500 rounded"></div>
                <span className="text-sm">Fire</span>
              </Button>
              
              <Button
                onClick={() => handleEmergencyType('collision')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <Ship className="h-8 w-8" />
                <span className="text-sm">Collision</span>
              </Button>
              
              <Button
                onClick={() => handleEmergencyType('medical')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <Heart className="h-8 w-8" />
                <span className="text-sm">Medical</span>
              </Button>
              
              <Button
                onClick={() => handleEmergencyType('engine_failure')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <Anchor className="h-8 w-8" />
                <span className="text-sm">Engine Failure</span>
              </Button>
              
              <Button
                onClick={() => handleEmergencyType('other')}
                className="h-24 flex flex-col space-y-2 bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-8 w-8" />
                <span className="text-sm">Other</span>
              </Button>
            </div>

            {emergencyType && (
              <div className="mt-6 text-center">
                <Button
                  onClick={startSOS}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-xl px-8 py-4"
                >
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  ACTIVATE SOS FOR {emergencyType.replace('_', ' ').toUpperCase()}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SOS Countdown */}
        {isSOSActive && (
          <Card className="mb-8 border-red-500 bg-red-100">
            <CardContent className="text-center py-8">
              <div className="animate-pulse">
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-800 mb-2">
                  EMERGENCY SOS ACTIVATED
                </h2>
                <p className="text-xl text-red-700 mb-4">
                  Calling emergency services in {countdown}...
                </p>
                <div className="text-4xl font-mono font-bold text-red-900 mb-4">
                  {countdown}
                </div>
                <Button
                  onClick={cancelSOS}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-200"
                >
                  CANCEL SOS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message Sent */}
        {messageSent && (
          <Card className="mb-8 border-green-500 bg-green-100">
            <CardContent className="text-center py-8">
              <div className="text-green-600">
                <Shield className="h-16 w-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Emergency Alert Sent
                </h2>
                <p className="text-lg mb-4">
                  Your location and emergency details have been sent to emergency services.
                </p>
                <p className="text-sm">
                  Help is on the way. Stay calm and follow safety procedures.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <span>Emergency Contacts</span>
            </CardTitle>
            <CardDescription>Quick access to important contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {contact.type === 'coast_guard' && <Shield className="h-5 w-5 text-blue-600" />}
                    {contact.type === 'mechanic' && <Anchor className="h-5 w-5 text-blue-600" />}
                    {contact.type === 'office' && <Ship className="h-5 w-5 text-blue-600" />}
                    {contact.type === 'medical' && <Heart className="h-5 w-5 text-blue-600" />}
                    
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => makeCall(contact.phone)}
                    size="sm"
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span>Nearest Safe Harbor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Miami Harbor</strong></p>
                <p>Distance: 5.2 nautical miles</p>
                <p>Bearing: 45° NE</p>
                <p>Channel: 16</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radio className="h-5 w-5 text-blue-600" />
                <span>Emergency Radio Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Channel 16:</strong> Distress & Calling</p>
                <p><strong>Channel 13:</strong> Bridge to Bridge</p>
                <p><strong>Channel 6A:</strong> Intership Safety</p>
                <p><strong>Channel 22A:</strong> Coast Guard Liaison</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
