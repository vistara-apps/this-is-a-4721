import React from 'react'
import { Shield, Clock, Star, ExternalLink } from 'lucide-react'
import type { RightsCardData } from '../types'

interface RightsCardProps {
  data: RightsCardData
  isPro: boolean
  onUpgrade: () => void
}

export default function RightsCard({ data, isPro, onUpgrade }: RightsCardProps) {
  return (
    <div className="glass-effect rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{data.title}</h2>
          </div>
          <div className="flex items-center space-x-4 text-white/70 text-sm">
            <span>State: {data.state}</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated {new Date(data.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {!isPro && (
          <button
            onClick={onUpgrade}
            className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-medium transition-colors"
          >
            <Star className="h-4 w-4" />
            <span>Pro</span>
          </button>
        )}
      </div>

      <div className="bg-white/10 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-white">Your Rights Summary</h3>
        <p className="text-white/90 leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-medium text-green-200 mb-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>What TO Do</span>
          </h4>
          <ul className="space-y-1 text-green-100 text-sm">
            {data.whatToDo.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-medium text-red-200 mb-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>What NOT to Do</span>
          </h4>
          <ul className="space-y-1 text-red-100 text-sm">
            {data.whatNotToDo.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.keyLaws && data.keyLaws.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-medium text-blue-200 mb-2">Key State Laws</h4>
          <div className="space-y-2">
            {data.keyLaws.map((law, index) => (
              <div key={index} className="flex items-start justify-between">
                <span className="text-blue-100 text-sm">{law}</span>
                <ExternalLink className="h-4 w-4 text-blue-300 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <span className="text-white/70 text-sm">
          Generated for {data.state} • {data.language}
        </span>
        <button className="text-white hover:text-white/80 text-sm underline">
          View Full Guide
        </button>
      </div>
    </div>
  )
}