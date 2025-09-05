import React, { useState, useRef, useCallback } from 'react'
import { Video, Mic, Square, Upload, Lock, Download, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { startRecording, uploadToIPFS, saveRecordingLocally } from '../services/api'
import { useAppStore } from '../store'
import { config } from '../config'

interface RecordButtonProps {
  isRecording: boolean
  onToggleRecording: (recording: boolean) => void
  isPro: boolean
  onUpgrade: () => void
}

export default function RecordButton({ isRecording, onToggleRecording, isPro, onUpgrade }: RecordButtonProps) {
  const { t } = useTranslation()
  const { addRecording, currentRecording, setCurrentRecording } = useAppStore()
  
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleToggleRecording = useCallback(async () => {
    if (!isPro && !config.app.isDevelopment) {
      onUpgrade()
      return
    }
    
    setError(null)
    
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
      
      onToggleRecording(false)
      setCurrentRecording(null)
    } else {
      // Start recording
      try {
        const recorder = await startRecording(recordingType)
        mediaRecorderRef.current = recorder
        chunksRef.current = []
        setRecordingDuration(0)
        
        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1)
        }, 1000)
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }
        
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: recordingType === 'video' ? 'video/webm' : 'audio/webm'
          })
          setRecordedBlob(blob)
          
          // Create incident record
          const record = {
            recordId: `record-${Date.now()}`,
            timestamp: new Date().toISOString(),
            filePath: `local-${Date.now()}.${recordingType === 'video' ? 'webm' : 'webm'}`,
            storageType: 'local' as const,
            status: 'complete' as const,
            createdAt: new Date().toISOString()
          }
          
          addRecording(record)
        }
        
        recorder.onerror = (event) => {
          console.error('Recording error:', event)
          setError(t('errors.recording'))
          onToggleRecording(false)
        }
        
        recorder.start(1000) // Collect data every second
        onToggleRecording(true)
        setCurrentRecording(recorder)
        
      } catch (error) {
        console.error('Failed to start recording:', error)
        setError(t('errors.recording'))
      }
    }
  }, [isRecording, recordingType, isPro, onToggleRecording, onUpgrade, addRecording, setCurrentRecording, t])

  const handleUploadToIPFS = useCallback(async () => {
    if (!isPro) {
      onUpgrade()
      return
    }
    
    if (!recordedBlob) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      const file = new File([recordedBlob], `incident-${Date.now()}.webm`, {
        type: recordedBlob.type
      })
      
      const ipfsHash = await uploadToIPFS(file, {
        type: 'incident_recording',
        recordingType: recordingType,
        duration: recordingDuration
      })
      
      console.log('Uploaded to IPFS:', ipfsHash)
      // You could update the incident record with the IPFS hash here
      
    } catch (error) {
      console.error('IPFS upload failed:', error)
      setError(t('errors.upload'))
    } finally {
      setIsUploading(false)
    }
  }, [recordedBlob, recordingType, recordingDuration, isPro, onUpgrade, t])

  const handleSaveLocally = useCallback(() => {
    if (!recordedBlob) return
    
    const filename = `incident-${new Date().toISOString().split('T')[0]}-${Date.now()}.webm`
    saveRecordingLocally(recordedBlob, filename)
  }, [recordedBlob])

  const handleDeleteRecording = useCallback(() => {
    setRecordedBlob(null)
    setRecordingDuration(0)
    setError(null)
  }, [])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Type Selection */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setRecordingType('audio')}
          disabled={isRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            recordingType === 'audio'
              ? 'bg-white text-gray-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Mic className="h-4 w-4" />
          <span>{t('recording.audio')}</span>
        </button>
        <button
          onClick={() => setRecordingType('video')}
          disabled={isRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            recordingType === 'video'
              ? 'bg-white text-gray-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Video className="h-4 w-4" />
          <span>{t('recording.video')}</span>
        </button>
      </div>

      {/* Main Record Button */}
      <div className="flex flex-col items-center space-y-2">
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
        
        {/* Duration Display */}
        {isRecording && (
          <div className="text-white font-mono text-lg">
            {formatDuration(recordingDuration)}
          </div>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-red-200">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{t('recording.recording')}</span>
          </div>
          <p className="text-white/70 text-xs">{t('recording.tapToStop')}</p>
        </div>
      )}

      {/* Recording Controls */}
      {recordedBlob && !isRecording && (
        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <h4 className="text-white font-medium mb-2">{t('recording.complete')}</h4>
            <p className="text-white/70 text-sm">
              {t('recording.savedLocally', { type: recordingType })}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {t('common.duration')}: {formatDuration(recordingDuration)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleUploadToIPFS}
              disabled={!isPro || isUploading}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                isPro && !isUploading
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isPro ? (
                <Upload className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>
                {isUploading 
                  ? t('common.uploading') 
                  : isPro 
                    ? t('recording.uploadToIPFS') 
                    : t('recording.proRequired')
                }
              </span>
            </button>
            
            <button 
              onClick={handleSaveLocally}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{t('recording.saveLocally')}</span>
            </button>

            <button 
              onClick={handleDeleteRecording}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('common.delete')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-center text-white/60 text-xs max-w-md mx-auto">
        <p>
          {t('recording.infoText')} {' '}
          {isPro 
            ? t('recording.infoTextPro')
            : t('recording.infoTextFree')
          }
        </p>
      </div>
    </div>
  )
}
