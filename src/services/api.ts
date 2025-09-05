import OpenAI from 'openai'
import axios from 'axios'
import { config } from '../config'
import { db } from '../lib/supabase'
import type { UserLocation, RightsCardData, IncidentRecord } from '../types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
  dangerouslyAllowBrowser: true,
})

export async function detectUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation || !config.features.enableGeolocation) {
      // Fallback to IP-based detection
      detectLocationByIP().then(resolve).catch(() => {
        resolve(getDefaultLocation())
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location details
          const location = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          )
          resolve(location)
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          // Fallback to IP-based detection
          try {
            const ipLocation = await detectLocationByIP()
            resolve(ipLocation)
          } catch {
            resolve(getDefaultLocation())
          }
        }
      },
      async (error) => {
        console.error('Geolocation failed:', error)
        // Fallback to IP-based detection
        try {
          const ipLocation = await detectLocationByIP()
          resolve(ipLocation)
        } catch {
          resolve(getDefaultLocation())
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  })
}

// IP-based location detection
async function detectLocationByIP(): Promise<UserLocation> {
  try {
    const response = await axios.get('https://ipapi.co/json/')
    const data = response.data
    
    return {
      city: data.city || 'Unknown',
      state: data.region || 'Unknown',
      country: data.country_code || 'US',
      coordinates: {
        lat: data.latitude || 0,
        lng: data.longitude || 0
      }
    }
  } catch (error) {
    console.error('IP location detection failed:', error)
    throw error
  }
}

// Reverse geocoding using coordinates
async function reverseGeocode(lat: number, lng: number): Promise<UserLocation> {
  try {
    // Using OpenStreetMap Nominatim (free alternative)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
    
    const data = response.data
    const address = data.address || {}
    
    return {
      city: address.city || address.town || address.village || 'Unknown',
      state: address.state || 'Unknown',
      country: address.country_code?.toUpperCase() || 'US',
      coordinates: { lat, lng }
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    throw error
  }
}

// Default fallback location
function getDefaultLocation(): UserLocation {
  return {
    city: 'San Francisco',
    state: 'California',
    country: 'US',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  }
}

export async function generateRightsCard(state: string, language: 'en' | 'es' = 'en'): Promise<RightsCardData> {
  try {
    // First check if we have a cached version in the database
    if (config.supabase.url) {
      try {
        const existingCard = await db.rightsCards.getByState(state, language)
        if (existingCard) {
          return transformDbCardToRightsCard(existingCard)
        }
      } catch (error) {
        console.log('No existing card found, generating new one')
      }
    }

    const prompt = language === 'es' 
      ? `Genera una tarjeta completa de "Conoce Tus Derechos" para ${state}. Incluye:
        1. Un resumen claro de los derechos constitucionales durante encuentros policiales
        2. 5-7 cosas específicas QUE HACER durante interacciones policiales
        3. 5-7 cosas específicas QUE NO HACER
        4. 2-3 leyes o estatutos específicos del estado
        5. Hazlo práctico, preciso y fácil de entender
        
        Enfócate en paradas de tráfico, encuentros callejeros y visitas domiciliarias. Sé específico con las leyes de ${state} cuando sea aplicable.`
      : `Generate a comprehensive "Know Your Rights" card for ${state}. Include:
        1. A clear summary of constitutional rights during police encounters
        2. 5-7 specific things TO DO during police interactions
        3. 5-7 specific things NOT TO DO 
        4. 2-3 key state-specific laws or statutes
        5. Make it practical, accurate, and easy to understand
        
        Focus on traffic stops, street encounters, and home visits. Be specific to ${state} laws where applicable.`

    let generatedContent = ''
    
    // Use OpenAI API if available
    if (config.openai.apiKey && config.openai.apiKey !== 'demo-key') {
      try {
        const completion = await openai.chat.completions.create({
          model: config.openai.model,
          messages: [
            {
              role: "system",
              content: language === 'es' 
                ? "Eres un experto legal especializado en derechos constitucionales y leyes estatales. Proporciona orientación legal precisa y útil."
                : "You are a legal expert specializing in constitutional rights and state laws. Provide accurate, helpful legal guidance."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
        
        generatedContent = completion.choices[0]?.message?.content || ''
      } catch (error) {
        console.error('OpenAI API failed, using fallback content:', error)
      }
    }

    // Parse the generated content or use fallback data
    const rightsCard = generatedContent 
      ? parseGeneratedContent(generatedContent, state, language)
      : getFallbackRightsCard(state, language)

    // Save to database if Supabase is configured
    if (config.supabase.url) {
      try {
        await db.rightsCards.create({
          state: rightsCard.state,
          title: rightsCard.title,
          content: JSON.stringify(rightsCard),
          language: rightsCard.language
        })
      } catch (error) {
        console.error('Failed to save rights card to database:', error)
      }
    }

    return rightsCard
  } catch (error) {
    console.error('Failed to generate rights card:', error)
    // Return fallback data on any error
    return getFallbackRightsCard(state, language)
  }
}

// Helper function to parse AI-generated content
function parseGeneratedContent(content: string, state: string, language: 'en' | 'es'): RightsCardData {
  // This is a simplified parser - in production, you'd want more robust parsing
  const lines = content.split('\n').filter(line => line.trim())
  
  return {
    cardId: `rights-${state.toLowerCase()}-${Date.now()}`,
    state: state,
    title: language === 'es' ? `Conoce Tus Derechos - ${state}` : `Know Your Rights - ${state}`,
    summary: lines.slice(0, 3).join(' '),
    whatToDo: extractListItems(content, language === 'es' ? 'QUE HACER' : 'TO DO'),
    whatNotToDo: extractListItems(content, language === 'es' ? 'QUE NO HACER' : 'NOT TO DO'),
    keyLaws: extractListItems(content, language === 'es' ? 'leyes' : 'laws'),
    content: content,
    language: language,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Helper function to extract list items from generated content
function extractListItems(content: string, section: string): string[] {
  const lines = content.toLowerCase().split('\n')
  const sectionIndex = lines.findIndex(line => line.includes(section.toLowerCase()))
  
  if (sectionIndex === -1) return []
  
  const items: string[] = []
  for (let i = sectionIndex + 1; i < lines.length && items.length < 7; i++) {
    const line = lines[i].trim()
    if (line.match(/^\d+\./) || line.startsWith('-') || line.startsWith('•')) {
      items.push(line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, ''))
    } else if (line === '' || line.includes(':')) {
      break
    }
  }
  
  return items
}

// Fallback rights card data
function getFallbackRightsCard(state: string, language: 'en' | 'es'): RightsCardData {
  if (language === 'es') {
    return {
      cardId: `rights-${state.toLowerCase()}-${Date.now()}`,
      state: state,
      title: `Conoce Tus Derechos - ${state}`,
      summary: `En ${state}, tienes derechos constitucionales fundamentales durante cualquier encuentro policial. Tienes derecho a permanecer en silencio, derecho a rechazar registros sin orden judicial, y derecho a un abogado. Estos derechos aplican durante paradas de tráfico, encuentros callejeros y en tu hogar. Mantén la calma, sé respetuoso, pero afirma claramente tus derechos.`,
      whatToDo: [
        'Mantén las manos visibles en todo momento',
        'Declara claramente "Estoy ejerciendo mi derecho a permanecer en silencio"',
        'Pregunta "¿Soy libre de irme?" para determinar si estás detenido',
        'Solicita ver una orden antes de permitir registros',
        'Recuerda números de placa y patrulla',
        'Mantén la calma y evita movimientos bruscos',
        'Proporciona solo identificación requerida cuando estés legalmente detenido'
      ],
      whatNotToDo: [
        'Nunca resistas físicamente, aunque creas que la parada es ilegal',
        'No respondas preguntas más allá de identificación básica',
        'No consientas registros de tu persona, vehículo o hogar',
        'No mientas o proporciones información falsa',
        'No discutas la legalidad de la parada durante el encuentro',
        'No alcances nada sin permiso',
        'No hagas movimientos bruscos o gestos'
      ],
      keyLaws: [
        `Constitución de ${state} Artículo 1, Sección 7 - Protección contra registros irrazonables`,
        `Código Vehicular de ${state} 12500 - Requisito de licencia durante paradas de tráfico`,
        `Cuarta Enmienda - Protección contra registro e incautación irrazonables`
      ],
      content: '',
      language: 'es',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  return {
    cardId: `rights-${state.toLowerCase()}-${Date.now()}`,
    state: state,
    title: `Know Your Rights - ${state}`,
    summary: `In ${state}, you have fundamental constitutional rights during any police encounter. You have the right to remain silent, the right to refuse searches without a warrant, and the right to an attorney. These rights apply during traffic stops, street encounters, and at your home. Stay calm, be respectful, but clearly assert your rights.`,
    whatToDo: [
      'Keep your hands visible at all times',
      'Clearly state "I am exercising my right to remain silent"',
      'Ask "Am I free to leave?" to determine if you\'re detained',
      'Request to see a warrant before allowing any searches',
      'Remember officer badge numbers and patrol car numbers',
      'Stay calm and avoid sudden movements',
      'Provide only required identification when legally detained'
    ],
    whatNotToDo: [
      'Never physically resist, even if you believe the stop is unlawful',
      'Don\'t answer questions beyond basic identification',
      'Don\'t consent to searches of your person, vehicle, or home',
      'Don\'t lie or provide false information',
      'Don\'t argue about the legality of the stop during the encounter',
      'Don\'t reach for anything without permission',
      'Don\'t make sudden movements or gestures'
    ],
    keyLaws: [
      `${state} Constitution Article 1, Section 7 - Protection against unreasonable searches`,
      `${state} Vehicle Code 12500 - License requirement during traffic stops`,
      `Fourth Amendment - Protection against unreasonable search and seizure`
    ],
    content: '',
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Transform database card to RightsCardData
function transformDbCardToRightsCard(dbCard: any): RightsCardData {
  try {
    const parsedContent = JSON.parse(dbCard.content)
    return {
      ...parsedContent,
      cardId: dbCard.card_id,
      createdAt: dbCard.created_at,
      updatedAt: dbCard.updated_at
    }
  } catch {
    // If parsing fails, create a basic card from database data
    return {
      cardId: dbCard.card_id,
      state: dbCard.state,
      title: dbCard.title,
      summary: 'Rights information for ' + dbCard.state,
      whatToDo: [],
      whatNotToDo: [],
      keyLaws: [],
      content: dbCard.content,
      language: dbCard.language,
      createdAt: dbCard.created_at,
      updatedAt: dbCard.updated_at
    }
  }
}

export async function uploadToIPFS(file: File, metadata?: any): Promise<string> {
  try {
    if (!config.features.enableIPFSStorage || !config.pinata.jwt) {
      throw new Error('IPFS storage not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    
    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'incident_recording',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }))
    }

    // Add pinning options
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    }))

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pinata.jwt}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // Store the IPFS hash in the database if available
    if (config.supabase.url && result.IpfsHash) {
      try {
        await db.incidentRecords.create({
          file_path: result.IpfsHash,
          storage_type: 'ipfs',
          status: 'uploaded'
        })
      } catch (error) {
        console.error('Failed to save IPFS record to database:', error)
      }
    }

    return result.IpfsHash
  } catch (error) {
    console.error('Failed to upload to IPFS:', error)
    throw error
  }
}

// Get file from IPFS
export async function getFromIPFS(hash: string): Promise<string> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status}`)
    }

    return response.url
  } catch (error) {
    console.error('Failed to get from IPFS:', error)
    throw error
  }
}

// Recording functionality
export async function startRecording(type: 'audio' | 'video' = 'video'): Promise<MediaRecorder> {
  try {
    const constraints = type === 'video' 
      ? { video: true, audio: true }
      : { audio: true }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: type === 'video' ? 'video/webm' : 'audio/webm'
    })

    return mediaRecorder
  } catch (error) {
    console.error('Failed to start recording:', error)
    throw error
  }
}

// Save recording locally
export function saveRecordingLocally(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to save recording locally:', error)
    throw error
  }
}

// Stripe payment integration
export async function createStripeCheckout(priceId: string): Promise<string> {
  try {
    if (!config.features.enableStripePayments) {
      throw new Error('Stripe payments not enabled')
    }

    // This would typically be handled by your backend
    // For demo purposes, we'll return a mock checkout URL
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Failed to create Stripe checkout:', error)
    throw error
  }
}

// Legal scripts generation
export async function generateLegalScripts(state: string, language: 'en' | 'es' = 'en'): Promise<any[]> {
  try {
    const scenarios = language === 'es' 
      ? [
          'Parada de tráfico',
          'Encuentro callejero',
          'Visita domiciliaria',
          'Detención temporal',
          'Registro de vehículo'
        ]
      : [
          'Traffic stop',
          'Street encounter', 
          'Home visit',
          'Temporary detention',
          'Vehicle search'
        ]

    const scripts = []

    for (const scenario of scenarios) {
      const prompt = language === 'es'
        ? `Genera un guión legal específico para ${scenario} en ${state}. Incluye frases exactas que una persona debe decir para ejercer sus derechos constitucionales. Hazlo claro, respetuoso pero firme.`
        : `Generate a specific legal script for ${scenario} in ${state}. Include exact phrases a person should say to exercise their constitutional rights. Make it clear, respectful but firm.`

      let scriptContent = ''

      if (config.openai.apiKey && config.openai.apiKey !== 'demo-key') {
        try {
          const completion = await openai.chat.completions.create({
            model: config.openai.model,
            messages: [
              {
                role: "system",
                content: language === 'es'
                  ? "Eres un experto legal. Proporciona guiones específicos y prácticos para ejercer derechos constitucionales."
                  : "You are a legal expert. Provide specific, practical scripts for exercising constitutional rights."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.2
          })

          scriptContent = completion.choices[0]?.message?.content || ''
        } catch (error) {
          console.error('Failed to generate script:', error)
        }
      }

      scripts.push({
        id: `script-${scenario.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        title: scenario,
        scenario: scenario,
        script: scriptContent || getFallbackScript(scenario, language),
        language: language,
        state: state
      })
    }

    return scripts
  } catch (error) {
    console.error('Failed to generate legal scripts:', error)
    return []
  }
}

// Fallback scripts
function getFallbackScript(scenario: string, language: 'en' | 'es'): string {
  const scripts = {
    en: {
      'Traffic stop': 'Officer, I am exercising my right to remain silent. Am I free to leave? I do not consent to any searches.',
      'Street encounter': 'I am exercising my right to remain silent. Am I being detained? I would like to leave.',
      'Home visit': 'I am exercising my right to remain silent. Do you have a warrant? I do not consent to entry or searches.',
      'Temporary detention': 'I am exercising my right to remain silent. I want to speak to a lawyer. Am I under arrest?',
      'Vehicle search': 'I do not consent to any searches of my vehicle. I am exercising my right to remain silent.'
    },
    es: {
      'Parada de tráfico': 'Oficial, estoy ejerciendo mi derecho a permanecer en silencio. ¿Soy libre de irme? No consiento ningún registro.',
      'Encuentro callejero': 'Estoy ejerciendo mi derecho a permanecer en silencio. ¿Estoy detenido? Me gustaría irme.',
      'Visita domiciliaria': 'Estoy ejerciendo mi derecho a permanecer en silencio. ¿Tiene una orden? No consiento entrada o registros.',
      'Detención temporal': 'Estoy ejerciendo mi derecho a permanecer en silencio. Quiero hablar con un abogado. ¿Estoy arrestado?',
      'Registro de vehículo': 'No consiento ningún registro de mi vehículo. Estoy ejerciendo mi derecho a permanecer en silencio.'
    }
  }

  return scripts[language][scenario] || scripts.en[scenario] || 'I am exercising my right to remain silent.'
}
