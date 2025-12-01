'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, XCircle, Loader2, Info } from 'lucide-react'

interface DatabaseInfo {
  [key: string]: {
    count: number;
    error?: string;
  };
}

export default function DatabaseTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<DatabaseInfo>({})

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    const tests = []

    // Test 1: Check Supabase connection
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').single()
      
      tests.push({
        name: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Successfully connected to Supabase'
      })
    } catch (err) {
      tests.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Failed to connect to Supabase'
      })
    }

    // Test 2: Check user_profiles table
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, created_at')
        .limit(5)
      
      tests.push({
        name: 'user_profiles Table',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} profiles`
      })
    } catch (err) {
      tests.push({
        name: 'user_profiles Table',
        status: 'error',
        message: 'Failed to read user_profiles'
      })
    }

    // Test 3: Check boats table
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('id, name, type, status')
        .limit(5)
      
      tests.push({
        name: 'boats Table',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} boats`
      })
    } catch (err) {
      tests.push({
        name: 'boats Table',
        status: 'error',
        message: 'Failed to read boats'
      })
    }

    // Test 4: Test insert operation
    try {
      const testData = {
        name: `Test Boat ${Date.now()}`,
        type: 'scuba',
        capacity: 10,
        fuel_capacity: 100,
        fuel_type: 'diesel',
        engine_hours: 0,
        status: 'active'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('boats')
        .insert(testData)
        .select()
        .single()
      
      if (insertError) {
        tests.push({
          name: 'Insert Operation',
          status: 'error',
          message: insertError.message
        })
      } else {
        tests.push({
          name: 'Insert Operation',
          status: 'success',
          message: `Successfully inserted boat with ID: ${insertData.id}`
        })

        // Clean up - delete test boat
        await supabase
          .from('boats')
          .delete()
          .eq('id', insertData.id)
      }
    } catch (err) {
      tests.push({
        name: 'Insert Operation',
        status: 'error',
        message: 'Insert operation failed'
      })
    }

    // Test 5: Check RLS policies
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

    // Test 6: Check other required tables
    const requiredTables = ['boat_trips', 'trip_tracking_points', 'maintenance_records', 'maintenance_schedule', 'fuel_consumption']
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('count').single()
        
        tests.push({
          name: `${table} Table`,
          status: error ? 'error' : 'success',
          message: error ? error.message : `Table exists and accessible`
        })
      } catch (err) {
        tests.push({
          name: `${table} Table`,
          status: 'error',
          message: 'Table not accessible'
        })
      }
    }

    setResults(tests)
    setLoading(false)
  }

  const getDatabaseInfo = async () => {
    try {
      const tables = ['user_profiles', 'boats', 'boat_trips', 'trip_tracking_points', 'maintenance_records', 'maintenance_schedule', 'fuel_consumption']
      const info: DatabaseInfo = {}

      for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        info[table] = { count: count || 0, error: error?.message }
      }

      setDbInfo(info)
    } catch (err) {
      console.error('Error getting database info:', err)
    }
  }

  useEffect(() => {
    getDatabaseInfo()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Connectivity Test</span>
        </CardTitle>
        <CardDescription>
          Test your Supabase database connection and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Database Info */}
        {dbInfo && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Database Overview</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(dbInfo).map(([table, info]) => (
                <div key={table} className="flex justify-between">
                  <span className="font-medium text-blue-800">{table}:</span>
                  <span className={info.error ? 'text-red-600' : 'text-green-600'}>
                    {info.error ? 'Error' : info.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Button */}
        <Button 
          onClick={testDatabaseConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Database...
            </>
          ) : (
            'Run Comprehensive Database Test'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            <div className="space-y-2">
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
          </div>
        )}

        {/* Environment Variables Help */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Environment Variables</h3>
          <p className="text-sm text-gray-600 mb-3">
            Make sure these are set in your .env.local file:
          </p>
          <div className="space-y-1 text-xs font-mono bg-gray-100 p-3 rounded">
            <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
            <div>SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}