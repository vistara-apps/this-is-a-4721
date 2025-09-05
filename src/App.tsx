import React, { useEffect } from 'react'
import { Shield, MapPin, Users, FileText, Video, Mic, Share2, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AppShell from './components/AppShell'
import RightsCard from './components/RightsCard'
import RecordButton from './components/RecordButton'
import Modal from './components/Modal'
import ScriptsSection from './components/ScriptsSection'
import SubscriptionCard from './components/SubscriptionCard'
import { detectUserLocation, generateRightsCard } from './services/api'
import { useAppStore } from './store'
import './i18n' // Initialize i18n

function App() {
  const { t, i18n } = useTranslation()
  const {
    userLocation,
    rightsCard,
    subscriptionTier,
    isRecording,
    showSubscriptionModal,
    activeTab,
    isLoading,
    language,
    setUserLocation,
    setRightsCard,
    setSubscriptionTier,
    setRecording,
    setShowSubscriptionModal,
    setActiveTab,
    setLoading,
    setLanguage
  } = useAppStore()

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    // Sync i18n language with store
    if (language !== i18n.language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  const initializeApp = async () => {
    setLoading(true)
    try {
      // Detect user location
      const location = await detectUserLocation()
      setUserLocation(location)
      
      // Generate rights card for user's state
      if (location) {
        const card = await generateRightsCard(location.state, language)
        setRightsCard(card)
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    setShowSubscriptionModal(true)
  }

  const handleSubscribe = (tier: 'free' | 'pro') => {
    setSubscriptionTier(tier)
    setShowSubscriptionModal(false)
  }

  const handleLanguageChange = (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
    
    // Regenerate rights card in new language
    if (userLocation) {
      generateRightsCard(userLocation.state, newLanguage)
        .then(setRightsCard)
        .catch(console.error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-3 text-white">{t('common.loading')}</span>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">{t('appName')}</h1>
          </div>
          <p className="text-white/80 text-lg">{t('tagline')}</p>
          
          {/* Language Switcher */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 rounded text-sm ${
                language === 'en' 
                  ? 'bg-white text-gray-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('es')}
              className={`px-3 py-1 rounded text-sm ${
                language === 'es' 
                  ? 'bg-white text-gray-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ES
            </button>
          </div>
          
          {userLocation && (
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{userLocation.city}, {userLocation.state}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="glass-effect rounded-lg p-1 flex space-x-1">
            {[
              { id: 'rights', label: t('nav.rights'), icon: Shield },
              { id: 'scripts', label: t('nav.scripts'), icon: FileText },
              { id: 'record', label: t('nav.record'), icon: Video },
              { id: 'share', label: t('nav.share'), icon: Share2 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === id
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'rights' && rightsCard && (
            <div className="space-y-6">
              <RightsCard
                data={rightsCard}
                isPro={subscriptionTier === 'pro'}
                onUpgrade={handleUpgrade}
              />
              
              {subscriptionTier === 'free' && (
                <SubscriptionCard onUpgrade={handleUpgrade} />
              )}
            </div>
          )}

          {activeTab === 'scripts' && (
            <ScriptsSection
              state={userLocation?.state || 'General'}
              isPro={subscriptionTier === 'pro'}
              onUpgrade={handleUpgrade}
            />
          )}

          {activeTab === 'record' && (
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">{t('recording.title')}</h3>
                <p className="text-white/80">
                  {t('recording.description')}
                </p>
                
                <RecordButton
                  isRecording={isRecording}
                  onToggleRecording={setRecording}
                  isPro={subscriptionTier === 'pro'}
                  onUpgrade={handleUpgrade}
                />
                
                {subscriptionTier === 'free' && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                      <Star className="h-4 w-4 inline mr-1" />
                      {t('subscription.upgradeForFeatures')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'share' && rightsCard && (
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">{t('sharing.title')}</h3>
                <p className="text-white/80">
                  {t('sharing.description')}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>Share via Text</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors">
                    <Users className="h-4 w-4" />
                    <span>Share on Social</span>
                  </button>
                </div>
              </div>
              
              <div className="glass-effect rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4">Preview</h4>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h5 className="font-semibold text-gray-900">Know Your Rights - {userLocation?.state}</h5>
                  <p className="text-gray-700 text-sm">{rightsCard.summary}</p>
                  <div className="text-xs text-gray-500">Generated by Know My Rights AI</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Modal */}
        <Modal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          title="Upgrade to Pro"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Full Features</h3>
              <p className="text-gray-600">Get unlimited access to all premium features</p>
            </div>

            <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Pro Plan</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">$7</div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Unlimited incident recording</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>IPFS decentralized storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Advanced legal scripts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('pro')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Subscribe Now
            </button>
          </div>
        </Modal>
      </div>
    </AppShell>
  )
}

export default App
