import { useState, useEffect, useCallback, useRef } from 'react'
import { GPSPosition } from '@/types/app'
import { throttle, debounce } from '@/lib/utils'

interface UseGPSOptions {
  watchInterval?: number // milliseconds
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  enableBackgroundTracking?: boolean
}

interface UseGPSReturn {
  position: GPSPosition | null
  error: string | null
  isTracking: boolean
  accuracy: 'high' | 'medium' | 'low' | 'poor'
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor'
  startTracking: () => void
  stopTracking: () => void
  getCurrentPosition: () => Promise<GPSPosition | null>
  requestPermission: () => Promise<boolean>
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt'
}

export function useGPS(options: UseGPSOptions = {}): UseGPSReturn {
  const {
    watchInterval = 30000, // 30 seconds default
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    enableBackgroundTracking = false
  } = options

  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')
  
  const watchIdRef = useRef<number | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined'

  // Calculate accuracy level
  const getAccuracyLevel = useCallback((accuracy: number): 'high' | 'medium' | 'low' | 'poor' => {
    if (accuracy < 5) return 'high'
    if (accuracy < 10) return 'medium'
    if (accuracy < 20) return 'low'
    return 'poor'
  }, [])

  // Calculate signal strength
  const getSignalStrength = useCallback((accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (accuracy < 3) return 'excellent'
    if (accuracy < 8) return 'good'
    if (accuracy < 15) return 'fair'
    return 'poor'
  }, [])

  // Check current permission status
  const checkPermissionStatus = useCallback(async (): Promise<'unknown' | 'granted' | 'denied' | 'prompt'> => {
    if (!isBrowser || !navigator.geolocation) {
      return 'denied'
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        const status = permission.state as 'unknown' | 'granted' | 'denied' | 'prompt'
        setPermissionStatus(status)
        setPermissionGranted(status === 'granted')
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          const newStatus = permission.state as 'unknown' | 'granted' | 'denied' | 'prompt'
          setPermissionStatus(newStatus)
          setPermissionGranted(newStatus === 'granted')
        })
        
        return status
      }
    } catch (error) {
      console.warn('Permission API not available:', error)
    }

    // Fallback: try to get position to check permission
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1000 })
      })
      setPermissionStatus('granted')
      setPermissionGranted(true)
      return 'granted'
    } catch (error) {
      const geoError = error as GeolocationPositionError
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setPermissionStatus('denied')
        setPermissionGranted(false)
        return 'denied'
      }
      setPermissionStatus('prompt')
      setPermissionGranted(null)
      return 'prompt'
    }
  }, [isBrowser])

  // Request GPS permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isBrowser || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setPermissionStatus('denied')
      setPermissionGranted(false)
      return false
    }

    try {
      // First check current status
      const currentStatus = await checkPermissionStatus()
      
      if (currentStatus === 'granted') {
        return true
      }

      if (currentStatus === 'denied') {
        setError('Location permission denied. Please enable location access in your device settings.')
        return false
      }

      // Try to get position to trigger permission prompt
      const testPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        )
      })

      if (testPosition) {
        setPermissionStatus('granted')
        setPermissionGranted(true)
        return true
      }
      
      return false
    } catch (error) {
      const geoError = error as GeolocationPositionError
      let errorMessage = 'Unknown error occurred'
      
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access in your device settings.'
          setPermissionStatus('denied')
          setPermissionGranted(false)
          break
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your GPS settings.'
          setPermissionStatus('denied')
          setPermissionGranted(false)
          break
        case geoError.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.'
          break
        default:
          errorMessage = `Location error: ${geoError.message}`
      }

      setError(errorMessage)
      return false
    }
  }, [isBrowser, checkPermissionStatus])

  // Handle position update
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const newPosition: GPSPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp,
    }

    setPosition(newPosition)
    setError(null)
  }, [])

  // Handle position error
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error occurred'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access in your device settings.'
        setPermissionStatus('denied')
        setPermissionGranted(false)
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please check your GPS settings.'
        setPermissionStatus('denied')
        setPermissionGranted(false)
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.'
        break
      default:
        errorMessage = `Location error: ${error.message}`
    }

    setError(errorMessage)
    setIsTracking(false)
  }, [])

  // Get current position once
  const getCurrentPosition = useCallback(async (): Promise<GPSPosition | null> => {
    if (!isBrowser || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return null
    }

    // Request permission first
    const hasPermission = await requestPermission()
    if (!hasPermission) {
      return null
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionUpdate(position)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          })
        },
        handleError,
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    })
  }, [isBrowser, enableHighAccuracy, timeout, maximumAge, handlePositionUpdate, handleError, requestPermission])

  // Start continuous tracking
  const startTracking = useCallback(async () => {
    if (!isBrowser || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    // Request permission first
    const hasPermission = await requestPermission()
    if (!hasPermission) {
      return
    }

    setIsTracking(true)
    setError(null)

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )

    // If background tracking is enabled, also use interval as fallback
    if (enableBackgroundTracking && watchInterval > 0) {
      intervalIdRef.current = setInterval(() => {
        getCurrentPosition()
      }, watchInterval)
    }
  }, [isBrowser, enableHighAccuracy, timeout, maximumAge, enableBackgroundTracking, watchInterval, handlePositionUpdate, handleError, getCurrentPosition, requestPermission])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && isBrowser) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

    setIsTracking(false)
  }, [isBrowser])

  // Initialize on mount - check permission status
  useEffect(() => {
    if (!isBrowser) return

    const initializeGPS = async () => {
      await checkPermissionStatus()
      
      // If permission is granted, get initial position
      if (permissionStatus === 'granted') {
        getCurrentPosition()
      }
    }

    initializeGPS()

    return () => {
      stopTracking()
    }
  }, [isBrowser, checkPermissionStatus, getCurrentPosition, stopTracking, permissionStatus])

  return {
    position,
    error,
    isTracking,
    accuracy: position ? getAccuracyLevel(position.accuracy) : 'poor',
    signalStrength: position ? getSignalStrength(position.accuracy) : 'poor',
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestPermission,
    permissionStatus,
  }
}

// Hook for tracking distance during a trip
export function useTripDistance() {
  const [totalDistance, setTotalDistance] = useState(0)
  const lastPositionRef = useRef<GPSPosition | null>(null)

  const addPoint = useCallback((position: GPSPosition) => {
    if (lastPositionRef.current) {
      // Calculate distance from last point
      const distance = calculateDistance(
        lastPositionRef.current.latitude,
        lastPositionRef.current.longitude,
        position.latitude,
        position.longitude
      )
      
      setTotalDistance(prev => prev + distance)
    }
    
    lastPositionRef.current = position
  }, [])

  const reset = useCallback(() => {
    setTotalDistance(0)
    lastPositionRef.current = null
  }, [])

  return {
    totalDistance,
    addPoint,
    reset,
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}