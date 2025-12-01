export interface Database {
  public: {
    Tables: {
      boats: {
        Row: {
          id: string
          name: string
          registration_number: string | null
          type: string
          capacity: number | null
          fuel_capacity: number | null
          fuel_type: string
          engine_hours: number
          current_latitude: number | null
          current_longitude: number | null
          status: 'active' | 'maintenance' | 'inactive'
          created_at: string
          updated_at: string
          icon_color: string
        }
        Insert: Omit<Database['public']['Tables']['boats']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['boats']['Insert']>
      }
      boat_trips: {
        Row: {
          id: string
          boat_id: string
          captain_id: string | null
          start_time: string
          end_time: string | null
          start_latitude: number | null
          start_longitude: number | null
          end_latitude: number | null
          end_longitude: number | null
          distance_traveled: number | null
          fuel_used: number | null
          engine_hours_used: number | null
          purpose: string | null
          status: 'active' | 'completed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['boat_trips']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['boat_trips']['Insert']>
      }
      trip_tracking_points: {
        Row: {
          id: string
          trip_id: string
          latitude: number
          longitude: number
          timestamp: string
          accuracy: number | null
          speed: number | null
          heading: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trip_tracking_points']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trip_tracking_points']['Insert']>
      }
      fuel_consumption: {
        Row: {
          id: string
          boat_id: string
          date: string
          fuel_added: number
          cost: number | null
          current_engine_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fuel_consumption']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fuel_consumption']['Insert']>
      }
      maintenance_records: {
        Row: {
          id: string
          boat_id: string
          technician_id: string | null
          maintenance_type: string
          date_performed: string
          next_due_date: string | null
          cost: number | null
          description: string | null
          engine_hours_at_service: number | null
          parts_used: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['maintenance_records']['Insert']>
      }
      maintenance_schedule: {
        Row: {
          id: string
          boat_id: string
          maintenance_type: string
          interval_hours: number | null
          interval_days: number | null
          last_performed: string | null
          next_due: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance_schedule']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['maintenance_schedule']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'captain' | 'mechanic' | 'viewer'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for convenience
export type Boat = Database['public']['Tables']['boats']['Row']
export type BoatInsert = Database['public']['Tables']['boats']['Insert']
export type BoatUpdate = Database['public']['Tables']['boats']['Update']

export type BoatTrip = Database['public']['Tables']['boat_trips']['Row']
export type BoatTripInsert = Database['public']['Tables']['boat_trips']['Insert']
export type BoatTripUpdate = Database['public']['Tables']['boat_trips']['Update']

export type TripTrackingPoint = Database['public']['Tables']['trip_tracking_points']['Row']
export type TripTrackingPointInsert = Database['public']['Tables']['trip_tracking_points']['Insert']
export type TripTrackingPointUpdate = Database['public']['Tables']['trip_tracking_points']['Update']

export type FuelConsumption = Database['public']['Tables']['fuel_consumption']['Row']
export type FuelConsumptionInsert = Database['public']['Tables']['fuel_consumption']['Insert']
export type FuelConsumptionUpdate = Database['public']['Tables']['fuel_consumption']['Update']

export type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row']
export type MaintenanceRecordInsert = Database['public']['Tables']['maintenance_records']['Insert']
export type MaintenanceRecordUpdate = Database['public']['Tables']['maintenance_records']['Update']

export type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedule']['Row']
export type MaintenanceScheduleInsert = Database['public']['Tables']['maintenance_schedule']['Insert']
export type MaintenanceScheduleUpdate = Database['public']['Tables']['maintenance_schedule']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type UserRole = 'admin' | 'captain' | 'mechanic' | 'viewer'
export type BoatStatus = 'active' | 'maintenance' | 'inactive'
export type TripStatus = 'active' | 'completed'
