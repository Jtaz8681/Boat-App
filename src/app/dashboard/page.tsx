'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGPS } from '@/hooks/useGPS'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ship, Navigation, Wrench, MapPin, Settings, LogOut, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import DatabaseTest from '@/components/DatabaseTest'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const { position, permissionStatus, requestPermission } = useGPS({
    watchInterval: 30000,
    enableHighAccuracy: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getGPSStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      case 'prompt':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGPSStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return position ? 'Active' : 'Permission Granted'
      case 'denied':
        return 'Permission Denied'
      case 'prompt':
        return 'Permission Required'
      default:
        return 'Checking...'
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Ship className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Captain's Tracker</h1>
                <p className="text-sm text-gray-500">Welcome, {profile.full_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Test Section */}
        <div className="mb-8">
          <DatabaseTest />
        </div>

        {/* GPS Status Alert */}
        {permissionStatus === 'denied' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Location Access Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    GPS permission is required to start trips. Please enable location access for this app.
                  </p>
                </div>
                <Button
                  onClick={requestPermission}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Enable GPS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/trips/new">
              <Button className="w-full h-20 flex flex-col space-y-2">
                <PlusCircle className="h-6 w-6" />
                <span className="text-sm">Start Trip</span>
              </Button>
            </Link>
            <Link href="/maintenance/new">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Report Issue</span>
              </Button>
            </Link>
            <Link href="/emergency">
              <Button variant="destructive" className="w-full h-20 flex flex-col space-y-2">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Emergency</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span>Current Status</span>
              </CardTitle>
              <CardDescription>Your current operational status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Trip</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">None</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">GPS Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getGPSStatusColor()}`}>
                    {getGPSStatusText()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sync Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ship className="h-5 w-5 text-blue-600" />
                <span>My Boats</span>
              </CardTitle>
              <CardDescription>Boats assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Sea Explorer</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Active</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Capacity: 12 divers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <span>Recent Maintenance</span>
              </CardTitle>
              <CardDescription>Latest maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-900">Engine Check</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">Sea Explorer - 2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Ship className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Dive trip completed</p>
                      <p className="text-sm text-gray-500">Sea Explorer • 2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Maintenance request submitted</p>
                      <p className="text-sm text-gray-500">Engine check • 2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}