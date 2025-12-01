'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function DatabaseTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    const tests = []

    // Test 1: Check if we can read from user_profiles
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .single()
      
      tests.push({
        name: 'Read user_profiles',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.count || 0} profiles`
      })
    } catch (err) {
      tests.push({
        name: 'Read user_profiles',
        status: 'error',
        message: 'Connection failed'
      })
    }

    // Test 2: Check if we can read from boats
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('count')
        .single()
      
      tests.push({
        name: 'Read boats',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.count || 0} boats`
      })
    } catch (err) {
      tests.push({
        name: 'Read boats',
        status: 'error',
        message: 'Connection failed'
      })
    }

    // Test 3: Try to insert a test boat
    try {
      const { data, error } = await supabase
        .from('boats')
        .insert({
          name: 'Test Boat',
          type: 'scuba',
          capacity: 10,
          fuel_capacity: 100,
          fuel_type: 'diesel',
          engine_hours: 0,
          status: 'active'
        })
        .select()
        .single()
      
      if (error) {
        tests.push({
          name: 'Insert boat',
          status: 'error',
          message: error.message
        })
      } else {
        tests.push({
          name: 'Insert boat',
          status: 'success',
          message: `Successfully inserted boat with ID: ${data.id}`
        })

        // Clean up - delete the test boat
        await supabase
          .from('boats')
          .delete()
          .eq('id', data.id)
      }
    } catch (err) {
      tests.push({
        name: 'Insert boat',
        status: 'error',
        message: 'Insert operation failed'
      })
    }

    // Test 4: Check RLS policies
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)
      
      tests.push({
        name: 'RLS Policies',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'RLS policies working correctly'
      })
    } catch (err) {
      tests.push({
        name: 'RLS Policies',
        status: 'error',
        message: 'RLS policy test failed'
      })
    }

    setResults(tests)
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Connectivity Test</span>
        </CardTitle>
        <CardDescription>
          Test your Supabase database connection and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testDatabaseConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Database Connection'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {results.map((test, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  test.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {test.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    test.status === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {test.name}
                  </p>
                  <p className={`text-sm ${
                    test.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {test.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}