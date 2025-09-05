export interface UserLocation {
  city: string
  state: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface RightsCardData {
  cardId: string
  state: string
  title: string
  summary: string
  whatToDo: string[]
  whatNotToDo: string[]
  keyLaws?: string[]
  content: string
  language: 'en' | 'es'
  createdAt: string
  updatedAt: string
}

export interface IncidentRecord {
  recordId: string
  userId?: string
  timestamp: string
  filePath: string
  storageType: 'local' | 'ipfs'
  status: 'recording' | 'complete' | 'uploaded'
  createdAt: string
}

export interface User {
  userId: string
  email?: string
  subscriptionTier: SubscriptionTier
  createdAt: string
  updatedAt: string
  statePreference?: string
}

export type SubscriptionTier = 'free' | 'pro'

export interface LegalScript {
  id: string
  title: string
  scenario: string
  script: string
  expanded?: string
  language: 'en' | 'es'
  state?: string
}