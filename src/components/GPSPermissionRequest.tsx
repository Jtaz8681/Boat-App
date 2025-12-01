'use client'

import { useState, useEffect } from 'react'
import { useGPS } from '@/hooks/useGPS'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Loader2, Settings, Smartphone } from 'lucide-react'

interface GPSPermissionRequestProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
}

export default function GPSPermissionRequest({ onPermissionGranted, onPermissionDenied }: GPSPermissionRequestProps) {
  const { requestPermission, error } = useGPS()
  const [isRequesting, setIsRequesting] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    checkPermissionStatus()
  }, [isClient])

  const checkPermissionStatus = async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        setPermissionStatus(permission.state as any)
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state as any)
        })
      } catch (error) {
        console.warn('Permission API not available:', error)
        setPermissionStatus('unknown')
      }
    }
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    
    const granted = await requestPermission()
    
    if (granted) {
      setPermissionStatus('granted')
      onPermissionGranted?.()
    } else {
      setPermissionStatus('denied')
      onPermissionDenied?.()
    }
    
    setIsRequesting(false)
  }

  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (permissionStatus === 'granted') {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <MapPin className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle>Location Access Required</CardTitle>
        <CardDescription>
          This app needs access to your device's GPS to track trips and provide location-based features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {permissionStatus === 'denied' && (
          <Alert variant="destructive">
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Location permission was denied. Please enable location access in your device settings:
              <br /><br />
              <strong>iOS:</strong> Settings → Privacy → Location Services → This App → "While Using"
              <br />
              <strong>Android:</strong> Settings → Apps → This App → Permissions → Location → "Allow only while using the app"
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Smartphone className="h-5 w-5" />
            <span>Enable GPS/location services on your device</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>Allow this app to access your location</span>
          </div>
        </div>

        {permissionStatus !== 'denied' && (
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full"
            style={{ minHeight: '44px' }}
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting Permission...
              </>
            ) : (
              'Enable Location Access'
            )}
          </Button>
        )}

        {permissionStatus === 'denied' && (
          <Button
            onClick={handleRequestPermission}
            variant="outline"
            className="w-full"
            style={{ minHeight: '44px' }}
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}