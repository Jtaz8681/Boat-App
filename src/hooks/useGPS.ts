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
  
  const watchIdRef = useRef<number | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

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
        errorMessage = 'Location permission denied. Please enable location access.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.'
        break
      default:
        errorMessage = `Location error: ${error.message}`
    }

    setError(errorMessage)
    setIsTracking(false)
  }, [])

  // Get current position once
  const getCurrentPosition = useCallback(async (): Promise<GPSPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser.')
        resolve(null)
        return
      }

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
  }, [enableHighAccuracy, timeout, maximumAge, handlePositionUpdate, handleError])

  // Start continuous tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
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
  }, [enableHighAccuracy, timeout, maximumAge, enableBackgroundTracking, watchInterval, handlePositionUpdate, handleError, getCurrentPosition])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

    setIsTracking(false)
  }, [])

  // Request background permission (for PWA)
  const requestBackgroundPermission = useCallback(async () => {
    if ('serviceWorker' in navigator && 'permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        if (permission.state === 'granted') {
          return true
        }
      } catch (error) {
        console.warn('Background location permission not available:', error)
      }
    }
    return false
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (enableBackgroundTracking) {
      requestBackgroundPermission()
    }

    return () => {
      stopTracking()
    }
  }, [enableBackgroundTracking, stopTracking, requestBackgroundPermission])

  return {
    position,
    error,
    isTracking,
    accuracy: position ? getAccuracyLevel(position.accuracy) : 'poor',
    signalStrength: position ? getSignalStrength(position.accuracy) : 'poor',
    startTracking,
    stopTracking,
    getCurrentPosition,
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
