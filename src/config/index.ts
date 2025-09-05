// Application Configuration
export const config = {
  // API Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview'
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    proPriceId: 'price_1234567890' // Replace with actual Stripe price ID
  },

  // Pinata IPFS Configuration
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY || '',
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
    jwt: import.meta.env.VITE_PINATA_JWT || ''
  },

  // Geocoding Configuration
  geocoding: {
    apiKey: import.meta.env.VITE_GEOCODING_API_KEY || ''
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Know My Rights AI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  },

  // Feature Flags
  features: {
    enableRecording: true,
    enableIPFSStorage: true,
    enableMultiLanguage: true,
    enableGeolocation: true,
    enableStripePayments: true,
    enableAnalytics: false
  },

  // Legal Content Configuration
  legal: {
    supportedStates: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
    ],
    supportedLanguages: ['en', 'es'],
    defaultLanguage: 'en'
  },

  // Recording Configuration
  recording: {
    maxDurationMinutes: 30,
    supportedFormats: ['webm', 'mp4', 'wav', 'mp3'],
    maxFileSizeMB: 100,
    compressionQuality: 0.8
  },

  // Storage Configuration
  storage: {
    localStoragePrefix: 'kmr_',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLocalRecordings: 10
  }
}

export default config
