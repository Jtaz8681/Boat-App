'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useGPS } from '@/hooks/useGPS'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Ship, MapPin, Users, Fuel, Clock, Play, Square } from 'lucide-react'
import Link from 'next/link'
import { Boat } from '@/types/database'
import { TripData } from '@/types/app'
import GPSPermissionRequest from '@/components/GPSPermissionRequest'

const tripSchema = z.object({
  boat_id: z.string().uuid('Please select a boat'),
  purpose: z.enum(['dive_trip', 'training', 'maintenance', 'transport', 'other']),
  passenger_count: z.number().min(1, 'Must have at least 1 passenger').max(50, 'Maximum 50 passengers'),
  start_fuel_level: z.number().min(0, 'Fuel level must be 0 or greater'),
  start_engine_hours: z.number().min(0, 'Engine hours must be 0 or greater'),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
  end_fuel_level: z.number().min(0, 'Fuel level must be 0 or greater').optional(),
  end_engine_hours: z.number().min(0, 'Engine hours must be 0 or greater').optional(),
})

type TripFormData = z.infer<typeof tripSchema>

export default function NewTripPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { position, getCurrentPosition, startTracking, stopTracking, isTracking, requestPermission, permissionStatus } = useGPS({
    watchInterval: 30000,
    enableHighAccuracy: true,
    enableBackgroundTracking: true,
  })

  const [boats, setBoats] = useState<Boat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      passenger_count: 1,
      start_fuel_level: 0,
      start_engine_hours: 0,
    },
  })

  // Fetch user's boats
  useEffect(() => {
    const fetchBoats = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockBoats: Boat[] = [
          {
            id: '1',
            name: 'Sea Explorer',
            registration_number: 'SEA-123',
            type: 'scuba',
            capacity: 12,
            fuel_capacity: 500,
            fuel_type: 'diesel',
            engine_hours: 1250,
            current_latitude: 25.7617,
            current_longitude: -80.1918,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            icon_color: '#3b82f6',
          },
        ]
        setBoats(mockBoats)
      } catch (error) {
        console.error('Error fetching boats:', error)
        setError('Failed to load boats')
      }
    }

    if (user) {
      fetchBoats()
    }
  }, [user])

  // Get initial position if permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted' && !position) {
      getCurrentPosition()
    }
  }, [permissionStatus, position, getCurrentPosition])

  // Handle trip start
  const onStartTrip = async (data: TripFormData) => {
    if (!position) {
      setError('GPS location required to start trip. Please enable location access.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newTrip: TripData = {
        boat_id: data.boat_id,
        captain_id: user?.id,
        start_time: new Date(),
        start_location: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        start_fuel_level: data.start_fuel_level,
        start_engine_hours: data.start_engine_hours,
        purpose: data.purpose,
        passenger_count: data.passenger_count,
        weather_conditions: data.weather_conditions,
        notes: data.notes,
        status: 'active',
      }

      // Save trip to database (mock for now)
      setActiveTrip(newTrip)
      
      // Start GPS tracking
      startTracking()

      // Redirect to active trip page
      router.push(`/trips/${newTrip.id}`)
    } catch (error) {
      console.error('Error starting trip:', error)
      setError('Failed to start trip')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle trip end
  const onEndTrip = async () => {
    if (!activeTrip) return

    setIsLoading(true)

    try {
      const updatedTrip: Partial<TripData> = {
        end_time: new Date(),
        end_location: position ? {
          latitude: position.latitude,
          longitude: position.longitude,
        } : undefined,
        end_fuel_level: watch('end_fuel_level'),
        end_engine_hours: watch('end_engine_hours'),
        status: 'completed',
      }

      // Update trip in database (mock for now)
      console.log('Ending trip:', updatedTrip)

      // Stop GPS tracking
      stopTracking()

      // Redirect to trip summary
      router.push(`/trips/${activeTrip.id}/summary`)
    } catch (error) {
      console.error('Error ending trip:', error)
      setError('Failed to end trip')
    } finally {
      setIsLoading(false)
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

  // Show GPS permission request if not granted
  if (permissionStatus === 'denied' || permissionStatus === 'prompt') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GPSPermissionRequest
          onPermissionGranted={() => {
            // Permission granted, the hook will automatically get position
          }}
          onPermissionDenied={() => {
            // Permission denied, user will see error message
          }}
        />
      </div>
    )
  }

  if (activeTrip) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Active Trip Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-xl font-semibold text-gray-900">Active Trip</h1>
              </div>
              <Button onClick={onEndTrip} variant="destructive" disabled={isLoading}>
                <Square className="h-4 w-4 mr-2" />
                End Trip
              </Button>
            </div>
          </div>
        </header>

        {/* Trip Status */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPS Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>GPS Status</span>
                </CardTitle>
                <CardDescription>Real-time location tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isTracking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isTracking ? 'Tracking' : 'Not Tracking'}
                    </span>
                  </div>
                  {position && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Lat:</span> {position.latitude.toFixed(6)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Lon:</span> {position.longitude.toFixed(6)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Accuracy:</span> {position.accuracy.toFixed(0)}m
                      </div>
                      {position.speed && (
                        <div className="text-sm">
                          <span className="font-medium">Speed:</span> {(position.speed * 1.94384).toFixed(1)} knots
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ship className="h-5 w-5 text-blue-600" />
                  <span>Trip Details</span>
                </CardTitle>
                <CardDescription>Current trip information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="font-medium">Purpose:</span> {activeTrip.purpose.replace('_', ' ')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Passengers:</span> {activeTrip.passenger_count}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Started:</span> {new Date(activeTrip.start_time).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {Math.floor((Date.now() - new Date(activeTrip.start_time).getTime()) / 60000)} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* End Trip Form */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Trip</CardTitle>
              <CardDescription>Enter final readings to complete your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end_fuel_level">Final Fuel Level (L)</Label>
                    <Input
                      id="end_fuel_level"
                      type="number"
                      step="0.1"
                      {...register('end_fuel_level')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_engine_hours">Final Engine Hours</Label>
                    <Input
                      id="end_engine_hours"
                      type="number"
                      step="0.1"
                      {...register('end_engine_hours')}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Ship className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Start New Trip</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* GPS Status */}
        {permissionStatus === 'unknown' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900">Checking GPS Permission</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please wait while we check GPS permissions...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
            <CardDescription>Enter trip details and start tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onStartTrip)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="boat_id">Select Boat</Label>
                    <select
                      id="boat_id"
                      {...register('boat_id', { required: true })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a boat</option>
                      {boats.map((boat) => (
                        <option key={boat.id} value={boat.id}>
                          {boat.name} ({boat.capacity} divers)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Trip Purpose</Label>
                    <select
                      id="purpose"
                      {...register('purpose', { required: true })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="dive_trip">Dive Trip</option>
                      <option value="training">Training</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="transport">Transport</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passenger_count">Passenger Count</Label>
                    <Input
                      id="passenger_count"
                      type="number"
                      min="1"
                      max="50"
                      {...register('passenger_count', { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_fuel_level">Starting Fuel Level (Liters)</Label>
                    <Input
                      id="start_fuel_level"
                      type="number"
                      step="0.1"
                      {...register('start_fuel_level', { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_engine_hours">Starting Engine Hours</Label>
                    <Input
                      id="start_engine_hours"
                      type="number"
                      step="0.1"
                      {...register('start_engine_hours', { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weather_conditions">Weather Conditions</Label>
                    <Input
                      id="weather_conditions"
                      placeholder="e.g., Clear seas, light winds"
                      {...register('weather_conditions')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  {...register('notes')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional trip notes..."
                />
              </div>

              {/* GPS Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  {position ? (
                    <>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-800">
                        GPS Active • {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)} • ±{position.accuracy.toFixed(0)}m
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-800">
                        {permissionStatus === 'granted' ? 'Acquiring GPS signal...' : 'GPS permission required'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !position || permissionStatus !== 'granted'}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Trip & Begin Tracking
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}