'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wrench, Camera, AlertTriangle, Upload, X, Check } from 'lucide-react'
import Link from 'next/link'
import { Boat } from '@/types/database'

const maintenanceSchema = z.object({
  boat_id: z.string().uuid('Please select a boat'),
  issue_category: z.enum(['engine', 'electrical', 'hull', 'safety_equipment', 'navigation', 'other']),
  urgency_level: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  symptoms: z.string().optional(),
  conditions: z.string().optional(),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function NewMaintenancePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [boats, setBoats] = useState<Boat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'video'
      const preview = fileType === 'image' ? URL.createObjectURL(file) : ''

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2),
        file,
        preview,
        type: fileType,
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
    })
  }

  // Remove uploaded file
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  // Handle form submission
  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create maintenance request
      const maintenanceRequest = {
        ...data,
        captain_id: user?.id,
        status: 'submitted',
        created_at: new Date().toISOString(),
        attachments: uploadedFiles.map(file => ({
          id: file.id,
          name: file.file.name,
          type: file.type,
          size: file.file.size,
        }))
      }

      // Save to database (mock for now)
      console.log('Creating maintenance request:', maintenanceRequest)

      // Show success message
      alert('Maintenance request submitted successfully!')

      // Redirect to maintenance history
      router.push('/maintenance/history')
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
      setError('Failed to submit maintenance request')
    } finally {
      setIsSubmitting(false)
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
              <Wrench className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Report Maintenance Issue</h1>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Information</CardTitle>
                  <CardDescription>Basic details about the maintenance issue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {boat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issue_category">Issue Category</Label>
                      <select
                        id="issue_category"
                        {...register('issue_category', { required: true })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="engine">Engine</option>
                        <option value="electrical">Electrical</option>
                        <option value="hull">Hull</option>
                        <option value="safety_equipment">Safety Equipment</option>
                        <option value="navigation">Navigation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency_level">Urgency Level</Label>
                    <select
                      id="urgency_level"
                      {...register('urgency_level', { required: true })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select urgency</option>
                      <option value="low">Low - Non-critical issue</option>
                      <option value="medium">Medium - Should be addressed soon</option>
                      <option value="high">High - Needs attention soon</option>
                      <option value="critical">Critical - Immediate attention required</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      {...register('title', { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <textarea
                      id="description"
                      rows={6}
                      {...register('description', { required: true })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide detailed information about the issue..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <textarea
                        id="symptoms"
                        rows={3}
                        {...register('symptoms')}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="What symptoms do you observe?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conditions">Conditions When Issue Occurs</Label>
                      <textarea
                        id="conditions"
                        rows={3}
                        {...register('conditions')}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Under what conditions does this occur?"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    <span>Attachments</span>
                  </CardTitle>
                  <CardDescription>Add photos or videos to help document the issue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        Upload images or short videos (max 10MB per file)
                      </p>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="relative group">
                            {file.type === 'image' ? (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <p className="text-xs text-gray-600 mt-1 truncate">{file.file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Urgency Indicator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Urgency Guide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-0.5"></div>
                      <div>
                        <p className="font-medium">Low</p>
                        <p className="text-gray-600">Minor issue, no impact on operations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-0.5"></div>
                      <div>
                        <p className="font-medium">Medium</p>
                        <p className="text-gray-600">Issue affects some operations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-0.5"></div>
                      <div>
                        <p className="font-medium">High</p>
                        <p className="text-gray-600">Significant operational impact</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-0.5"></div>
                      <div>
                        <p className="font-medium">Critical</p>
                        <p className="text-gray-600">Safety hazard or vessel immobilized</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/maintenance/history">
                      <Button variant="outline" className="w-full">
                        View Maintenance History
                      </Button>
                    </Link>
                    <Link href="/emergency">
                      <Button variant="destructive" className="w-full">
                        Emergency Contact
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Submit Maintenance Request
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
