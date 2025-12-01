'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Testing connection...')
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check environment variables
    const vars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    }
    setEnvVars(vars)

    // Test basic import
    try {
      const { supabase } = require('@/integrations/supabase/client')
      if (supabase) {
        setStatus('success')
        setMessage('Supabase client imported successfully!')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Import error: ${error}`)
    }
  }, [])

  const testDatabaseConnection = async () => {
    setStatus('loading')
    setMessage('Testing database connection...')

    try {
      const { supabase } = await import('@/integrations/supabase/client')
      
      // Simple test query
      const { data, error } = await supabase.from('boats').select('count').single()
      
      if (error) {
        setStatus('error')
        setMessage(`Database error: ${error.message}`)
      } else {
        setStatus('success')
        setMessage(`Database connected! Found ${data?.count || 0} boats`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Connection error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
        
        {/* Environment Variables Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="font-mono text-sm">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              <span>{message}</span>
            </div>
          </CardContent>
        </Card>

        {/* Test Button */}
        <Button onClick={testDatabaseConnection} disabled={status === 'loading'}>
          Test Database Connection
        </Button>

        {/* Instructions */}
        <Alert className="mt-6">
          <AlertDescription>
            <strong>If you see errors:</strong><br/>
            1. Make sure your .env.local file exists with the correct Supabase credentials<br/>
            2. Restart the development server after adding environment variables<br/>
            3. Verify your Supabase project is active and accessible
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}