import { Boat, BoatTrip, TripTrackingPoint, MaintenanceRecord } from './database'

// App-specific types that extend or complement the database types

export interface LocationPoint {
  trip_id: string
  latitude: number
  longitude: number
  timestamp: Date
  speed: number
  heading: number
  accuracy: number
  altitude: number
  synced: boolean
}

export interface MaintenanceRequest {
  id?: string
  boat_id: string
  category: 'engine' | 'electrical' | 'hull' | 'safety_equipment' | 'other'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  description: string
  symptoms: string
  conditions: string
  media_urls: string[]
  status: 'submitted' | 'in_progress' | 'completed' | 'rejected'
  created_at?: string
  updated_at?: string
}

export interface TripData {
  id?: string
  boat_id: string
  captain_id?: string
  start_time: Date
  end_time?: Date
  start_location?: {
    latitude: number
    longitude: number
  }
  end_location?: {
    latitude: number
    longitude: number
  }
  start_fuel_level: number
  end_fuel_level?: number
  start_engine_hours: number
  end_engine_hours?: number
  purpose: 'dive_trip' | 'training' | 'maintenance' | 'transport' | 'other'
  passenger_count: number
  weather_conditions?: string
  distance_traveled?: number
  fuel_used?: number
  engine_hours_used?: number
  status: 'active' | 'completed'
  notes?: string
  incidents?: string[]
  passenger_feedback?: string
}

export interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  timestamp: number
}

export interface SyncStatus {
  last_successful_sync: Date
  pending_records: number
  is_online: boolean
  syncing: boolean
  error?: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relation: string
  is_primary: boolean
}

export interface SafetyChecklist {
  id: string
  name: string
  items: SafetyChecklistItem[]
  is_completed: boolean
  completed_at?: Date
  completed_by?: string
}

export interface SafetyChecklistItem {
  id: string
  description: string
  is_required: boolean
  is_checked: boolean
  notes?: string
}

export interface WeatherAlert {
  id: string
  type: 'storm' | 'high_wind' | 'rough_seas' | 'fog' | 'other'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  title: string
  description: string
  start_time: Date
  end_time: Date
  affected_area: {
    latitude: number
    longitude: number
    radius: number
  }
}

export interface NotificationSettings {
  sync_status: boolean
  maintenance_updates: boolean
  weather_warnings: boolean
  schedule_reminders: boolean
  safety_alerts: boolean
  geofence_violations: boolean
  speed_alerts: boolean
  fuel_warnings: boolean
  maintenance_reminders: boolean
}

export interface AppSettings {
  location_tracking_interval: number // seconds
  map_style: 'street' | 'satellite' | 'terrain' | 'dark'
  offline_mode: boolean
  auto_sync: boolean
  battery_optimization: boolean
  notifications: NotificationSettings
  emergency_contacts: EmergencyContact[]
  preferred_boat_id?: string
}

export interface CaptainStats {
  total_trips: number
  total_distance: number
  total_fuel_used: number
  average_fuel_efficiency: number
  total_engine_hours: number
  maintenance_requests_submitted: number
  on_time_departures: number
  safety_checklists_completed: number
}

export interface OfflineQueue {
  pending_locations: LocationPoint[]
  pending_maintenance: MaintenanceRequest[]
  pending_trips: TripData[]
  pending_fuel_logs: any[]
}

export interface Geofence {
  id: string
  name: string
  center: {
    latitude: number
    longitude: number
  }
  radius: number
  is_active: boolean
  alert_type: 'warning' | 'error'
}

export interface SpeedAlert {
  max_speed: number
  warning_speed: number
  is_active: boolean
}

export interface FuelAlert {
  low_fuel_threshold: number // percentage
  critical_fuel_threshold: number // percentage
  is_active: boolean
}

// UI State Types
export interface AppState {
  user: any | null
  currentTrip: TripData | null
  currentLocation: GPSPosition | null
  isTracking: boolean
  syncStatus: SyncStatus
  settings: AppSettings
  onlineStatus: boolean
  emergencyMode: boolean
}

// Component Props Types
export interface MapProps {
  center: [number, number]
  zoom: number
  tripPoints?: TripTrackingPoint[]
  currentLocation?: GPSPosition
  waypoints?: Array<{ latitude: number; longitude: number; name: string }>
  showRoute?: boolean
  interactive?: boolean
}

export interface TripFormProps {
  trip?: TripData
  boats: Boat[]
  onSubmit: (trip: TripData) => void
  onCancel: () => void
}

export interface MaintenanceFormProps {
  request?: MaintenanceRequest
  boats: Boat[]
  onSubmit: (request: MaintenanceRequest) => void
  onCancel: () => void
}
