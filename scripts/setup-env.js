const fs = require('fs')
const path = require('path')

// Check if .env.local exists
const envPath = path.join(__dirname, '../.env.local')

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...')
  
  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Get these values from your Supabase project settings:
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to Settings > API
# 4. Copy Project URL and anon/public key
# 5. For service role key, go to Settings > Database > API (requires admin access)
`

  fs.writeFileSync(envPath, envTemplate)
  console.log('✅ .env.local file created!')
  console.log('📋 Please edit .env.local and add your Supabase credentials')
  console.log('🌐 Get credentials from: https://supabase.com/dashboard')
} else {
  console.log('✅ .env.local file already exists')
}

// Check if variables are set
const envContent = fs.readFileSync(envPath, 'utf8')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const missingVars = requiredVars.filter(varName => {
  const regex = new RegExp(`^${varName}=your_`, 'm')
  return regex.test(envContent)
})

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:')
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  console.log('📝 Please edit .env.local and add your Supabase credentials')
} else {
  console.log('✅ All environment variables are set!')
}