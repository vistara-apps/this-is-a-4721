import React, { useState } from 'react'
import { Video, Mic, Square, Upload, Lock } from 'lucide-react'

interface RecordButtonProps {
  isRecording: boolean
  onToggleRecording: (recording: boolean) => void
  isPro: boolean
  onUpgrade: () => void
}

export default function RecordButton({ isRecording, onToggleRecording, isPro, onUpgrade }: RecordButtonProps) {
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video')
  const [hasRecording, setHasRecording] = useState(false)

  const handleToggleRecording = () => {
    if (!isPro && isRecording) {
      onUpgrade()
      return
    }
    
    const newRecordingState = !isRecording
    onToggleRecording(newRecordingState)
    
    if (newRecordingState) {
      // Start recording
      setTimeout(() => {
        setHasRecording(true)
      }, 1000)
    }
  }

  const handleUploadToIPFS = () => {
    if (!isPro) {
      onUpgrade()
      return
    }
    
    // Simulate IPFS upload
    console.log('Uploading to IPFS...')
  }

  return (
    <div className="space-y-6">
      {/* Recording Type Selection */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setRecordingType('audio')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            recordingType === 'audio'
              ? 'bg-white text-gray-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>Audio</span>
        </button>
        <button
          onClick={() => setRecordingType('video')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            recordingType === 'video'
              ? 'bg-white text-gray-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Video</span>
        </button>
      </div>

      {/* Main Record Button */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleRecording}
          className={`relative w-24 h-24 rounded-full border-4 transition-all transform hover:scale-105 ${
            isRecording
              ? 'bg-red-500 border-red-300 pulse-recording'
              : 'bg-white/20 border-white/40 hover:bg-white/30'
          }`}
        >
          {isRecording ? (
            <Square className="h-8 w-8 text-white mx-auto" />
          ) : recordingType === 'video' ? (
            <Video className="h-8 w-8 text-white mx-auto" />
          ) : (
            <Mic className="h-8 w-8 text-white mx-auto" />
          )}
        </button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-red-200">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording in progress...</span>
          </div>
          <p className="text-white/70 text-xs">Tap the button again to stop recording</p>
        </div>
      )}

      {/* Recording Controls */}
      {hasRecording && !isRecording && (
        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <h4 className="text-white font-medium mb-2">Recording Complete</h4>
            <p className="text-white/70 text-sm">Your {recordingType} has been saved locally</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleUploadToIPFS}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                isPro
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              disabled={!isPro}
            >
              {isPro ? <Upload className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <span>{isPro ? 'Upload to IPFS' : 'Pro Required'}</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
              <Video className="h-4 w-4" />
              <span>Save Locally</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-center text-white/60 text-xs max-w-md mx-auto">
        <p>
          Record audio or video evidence during interactions. 
          {isPro 
            ? ' Your recordings are encrypted and stored securely on IPFS.' 
            : ' Upgrade to Pro for unlimited recording and secure IPFS storage.'
          }
        </p>
      </div>
    </div>
  )
}