import React from 'react'
import { Star, Shield, Video, Globe, Cloud } from 'lucide-react'

interface SubscriptionCardProps {
  onUpgrade: () => void
}

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  return (
    <div className="glass-effect rounded-xl p-6 space-y-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Star className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Upgrade to Pro</h3>
        </div>
        <p className="text-white/80">Unlock advanced features for complete legal protection</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <Video className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Unlimited Recording</div>
          <div className="text-white/70 text-xs">Audio & Video</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <Cloud className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">IPFS Storage</div>
          <div className="text-white/70 text-xs">Decentralized</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <Globe className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Multi-Language</div>
          <div className="text-white/70 text-xs">EN & ES</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <Shield className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <div className="text-white font-medium text-sm">Advanced Scripts</div>
          <div className="text-white/70 text-xs">State-Specific</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-1">$7<span className="text-lg font-normal text-white/70">/month</span></div>
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105"
        >
          Start Pro Trial
        </button>
        <p className="text-white/60 text-xs mt-2">7-day free trial • Cancel anytime</p>
      </div>
    </div>
  )
}