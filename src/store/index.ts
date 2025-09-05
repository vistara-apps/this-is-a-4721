import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserLocation, RightsCardData, IncidentRecord, User, SubscriptionTier } from '../types'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  subscriptionTier: SubscriptionTier
  
  // Location state
  userLocation: UserLocation | null
  
  // Rights card state
  rightsCard: RightsCardData | null
  isLoadingRightsCard: boolean
  
  // Recording state
  isRecording: boolean
  currentRecording: MediaRecorder | null
  recordings: IncidentRecord[]
  
  // UI state
  activeTab: 'rights' | 'scripts' | 'record' | 'share'
  language: 'en' | 'es'
  showSubscriptionModal: boolean
  isLoading: boolean
  
  // Legal scripts state
  legalScripts: any[]
  isLoadingScripts: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setSubscriptionTier: (tier: SubscriptionTier) => void
  setUserLocation: (location: UserLocation | null) => void
  setRightsCard: (card: RightsCardData | null) => void
  setLoadingRightsCard: (loading: boolean) => void
  setRecording: (recording: boolean) => void
  setCurrentRecording: (recorder: MediaRecorder | null) => void
  addRecording: (recording: IncidentRecord) => void
  removeRecording: (recordId: string) => void
  setActiveTab: (tab: 'rights' | 'scripts' | 'record' | 'share') => void
  setLanguage: (language: 'en' | 'es') => void
  setShowSubscriptionModal: (show: boolean) => void
  setLoading: (loading: boolean) => void
  setLegalScripts: (scripts: any[]) => void
  setLoadingScripts: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  subscriptionTier: 'free' as SubscriptionTier,
  userLocation: null,
  rightsCard: null,
  isLoadingRightsCard: false,
  isRecording: false,
  currentRecording: null,
  recordings: [],
  activeTab: 'rights' as const,
  language: 'en' as const,
  showSubscriptionModal: false,
  isLoading: false,
  legalScripts: [],
  isLoadingScripts: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      setUserLocation: (location) => set({ userLocation: location }),
      setRightsCard: (card) => set({ rightsCard: card }),
      setLoadingRightsCard: (loading) => set({ isLoadingRightsCard: loading }),
      setRecording: (recording) => set({ isRecording: recording }),
      setCurrentRecording: (recorder) => set({ currentRecording: recorder }),
      
      addRecording: (recording) => set((state) => ({
        recordings: [recording, ...state.recordings]
      })),
      
      removeRecording: (recordId) => set((state) => ({
        recordings: state.recordings.filter(r => r.recordId !== recordId)
      })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setLanguage: (language) => set({ language }),
      setShowSubscriptionModal: (show) => set({ showSubscriptionModal: show }),
      setLoading: (loading) => set({ isLoading: loading }),
      setLegalScripts: (scripts) => set({ legalScripts: scripts }),
      setLoadingScripts: (loading) => set({ isLoadingScripts: loading }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'know-my-rights-storage',
      partialize: (state) => ({
        subscriptionTier: state.subscriptionTier,
        userLocation: state.userLocation,
        language: state.language,
        recordings: state.recordings,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useSubscriptionTier = () => useAppStore((state) => state.subscriptionTier)
export const useUserLocation = () => useAppStore((state) => state.userLocation)
export const useRightsCard = () => useAppStore((state) => state.rightsCard)
export const useIsRecording = () => useAppStore((state) => state.isRecording)
export const useActiveTab = () => useAppStore((state) => state.activeTab)
export const useLanguage = () => useAppStore((state) => state.language)
export const useRecordings = () => useAppStore((state) => state.recordings)
export const useLegalScripts = () => useAppStore((state) => state.legalScripts)

export default useAppStore
