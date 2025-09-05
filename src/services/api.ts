import OpenAI from 'openai'
import type { UserLocation, RightsCardData } from '../types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'demo-key', // Replace with actual API key in production
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export async function detectUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to IP-based detection or default location
      resolve({
        city: 'San Francisco',
        state: 'California',
        country: 'US',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // In production, use a geocoding service to convert coordinates to location
          // For demo, return a sample location
          resolve({
            city: 'San Francisco',
            state: 'California', 
            country: 'US',
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          })
        } catch (error) {
          reject(error)
        }
      },
      (error) => {
        // Fallback location
        resolve({
          city: 'San Francisco',
          state: 'California',
          country: 'US',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  })
}

export async function generateRightsCard(state: string): Promise<RightsCardData> {
  try {
    const prompt = `Generate a comprehensive "Know Your Rights" card for ${state}. Include:
    1. A clear summary of constitutional rights during police encounters
    2. 5-7 specific things TO DO during police interactions
    3. 5-7 specific things NOT TO DO 
    4. 2-3 key state-specific laws or statutes
    5. Make it practical, accurate, and easy to understand
    
    Focus on traffic stops, street encounters, and home visits. Be specific to ${state} laws where applicable.`

    // For demo purposes, return sample data
    // In production, use OpenAI API:
    /*
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a legal expert specializing in constitutional rights and state laws. Provide accurate, helpful legal guidance."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })
    */

    // Sample data for demo
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
      content: '', // Full detailed content would go here
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to generate rights card:', error)
    throw error
  }
}

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // In production, integrate with Pinata IPFS
    const formData = new FormData()
    formData.append('file', file)

    // Sample implementation - replace with actual Pinata API call
    /*
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT_TOKEN}`
      },
      body: formData
    })
    
    const result = await response.json()
    return result.IpfsHash
    */

    // For demo, return a mock IPFS hash
    return `Qm${Math.random().toString(36).substring(2, 15)}`
  } catch (error) {
    console.error('Failed to upload to IPFS:', error)
    throw error
  }
}