# Captain's Boat Tracking Mobile App

A comprehensive mobile-first React Native/Next.js PWA for boat captains to track trips, report maintenance, and sync data with the main admin dashboard.

## 🚀 Features

### 🔐 Authentication & Security
- **Supabase Authentication** with email/password
- **Role-based access control** (captain role only)
- **Secure session management** with auto-logout
- **Protected routes** and user profiles

### 🚤 Trip Management
- **Pre-Trip Setup**
  - Boat selection (multiple boats support)
  - Fuel level input with validation
  - Engine hours recording
  - Trip purpose selection
  - Passenger count tracking
  - Weather condition notes

- **Real-time Trip Tracking**
  - GPS location tracking with configurable intervals
  - Background location tracking
  - Live speed & direction display
  - Path visualization on map
  - Distance traveled calculation
  - Engine hours monitoring
  - Fuel consumption estimates

- **Trip Completion**
  - Manual trip end with final readings
  - Trip summary generation
  - Incident reporting capability

### 📍 GPS Tracking System
- **High-accuracy GPS** with signal strength indicators
- **Configurable tracking intervals** (15-120 seconds)
- **Background location tracking** with battery optimization
- **Offline data storage** with automatic sync
- **Location data structure** with metadata

### 🛠️ Maintenance Reporting
- **Comprehensive maintenance request form**
- **Issue categorization** (engine, electrical, hull, safety)
- **Urgency levels** (low, medium, high, critical)
- **Rich text description** input
- **Multiple photo upload** with image annotation
- **Video recording/upload** capability
- **Offline media storage** with sync
- **Maintenance history** view with status tracking

### 🚨 Emergency Features
- **Quick-access emergency mode**
- **SOS activation** with 5-second countdown
- **Emergency type selection** (man overboard, fire, collision, etc.)
- **Automatic emergency services** calling
- **Location broadcasting** with GPS coordinates
- **Emergency contacts** management
- **Safety information** and radio channels

### ⚙️ Settings & Configuration
- **Location settings** (interval, background tracking, accuracy)
- **Notification preferences** (emergency, maintenance, weather)
- **Boat configuration** (fuel capacity, type, engine hours)
- **Emergency contacts** management
- **User profile** management

### 📱 Mobile-First Design
- **Touch-friendly interface** with large buttons
- **One-handed operation** optimization
- **High contrast** for sunlight visibility
- **Responsive design** for tablets and phones
- **Progressive Web App** capability

## 🛠️ Technical Stack

### Frontend
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Lucide React** icons

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** database with provided schema
- **Real-time subscriptions** for live updates

### PWA Features
- **Service Worker** for offline functionality
- **Web App Manifest** for installation
- **Offline caching** strategies
- **Background sync** capabilities

### GPS & Location
- **Geolocation API** for GPS tracking
- **Background location** tracking
- **Location accuracy** optimization
- **Battery-efficient** tracking intervals

## 📋 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd vs-boat-app
npm install
```

### 2. Environment Setup
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup
Run the provided SQL schema in your Supabase project to create:
- `boats` table
- `boat_trips` table
- `trip_tracking_points` table
- `maintenance_records` table
- `user_profiles` table
- And other required tables

### 4. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📱 Mobile Usage

### Installation
1. Open `http://localhost:3000` on your mobile device
2. Tap "Add to Home Screen" (iOS) or "Install App" (Android)
3. The app will install as a PWA with offline capabilities

### Required Permissions
- **Location** - Always allowed for background tracking
- **Camera** - For maintenance photos
- **Storage** - For offline data and media
- **Network** - For data synchronization

## 🗄️ Database Schema

### Core Tables
```sql
-- Boats
CREATE TABLE boats (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  registration_number text UNIQUE,
  type text DEFAULT 'scuba',
  capacity integer,
  fuel_capacity numeric,
  fuel_type text DEFAULT 'diesel',
  engine_hours numeric DEFAULT 0,
  current_latitude numeric,
  current_longitude numeric,
  status text DEFAULT 'active'
);

-- Boat Trips
CREATE TABLE boat_trips (
  id uuid PRIMARY KEY,
  boat_id uuid REFERENCES boats(id),
  captain_id uuid REFERENCES auth.users(id),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  distance_traveled numeric,
  fuel_used numeric,
  engine_hours_used numeric,
  purpose text,
  status text DEFAULT 'active'
);

-- Trip Tracking Points
CREATE TABLE trip_tracking_points (
  id uuid PRIMARY KEY,
  trip_id uuid REFERENCES boat_trips(id),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  accuracy numeric,
  speed numeric,
  heading numeric
);
```

## 🔄 Data Sync & Offline

### Offline Strategy
- **Local Storage** using localStorage for pending data
- **Queue System** for location updates and maintenance requests
- **Automatic Sync** when connection restored
- **Conflict Resolution** for duplicate data
- **Compression** for efficient data transfer

### Sync Status
- Real-time sync indicators
- Pending records counter
- Last successful sync timestamp
- Offline mode indicators

## 🔔 Notifications

### System Notifications
- Sync status alerts
- Maintenance updates from admin
- Weather warnings
- Boat schedule reminders

### Safety Alerts
- Geofence violations
- Speed alerts
- Fuel level warnings
- Engine hour maintenance reminders

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set all environment variables
- Configure Supabase production project
- Set up proper CORS settings
- Configure CDN for static assets

## 📊 Analytics & Reporting

### Captain Analytics
- Trip statistics (distance, fuel efficiency)
- Maintenance history trends
- Performance metrics (on-time departures)

### Data Export
- Trip reports generation
- Maintenance logs export
- Location history download

## 🔒 Security Considerations

### Authentication
- JWT tokens with proper expiration
- Secure session management
- Role-based access control
- Password requirements

### Data Protection
- HTTPS only in production
- Secure cookie handling
- Input validation and sanitization
- SQL injection prevention

## 🐛 Troubleshooting

### Common Issues

#### GPS Not Working
- Check location permissions
- Ensure location services are enabled
- Try high-accuracy mode
- Check browser compatibility

#### Sync Issues
- Verify network connection
- Check Supabase configuration
- Clear local storage and re-authenticate
- Check console for errors

#### PWA Installation
- Use HTTPS in production
- Check manifest configuration
- Verify service worker registration
- Clear browser cache

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is a production-ready application designed for real-world use by boat captains. Ensure proper testing and validation before deployment in a production environment.
