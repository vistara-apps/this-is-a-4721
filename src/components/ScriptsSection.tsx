import React, { useState } from 'react'
import { MessageSquare, Globe, Copy, Star, ChevronDown, ChevronUp } from 'lucide-react'

interface ScriptsSectionProps {
  state: string
  isPro: boolean
  onUpgrade: () => void
}

export default function ScriptsSection({ state, isPro, onUpgrade }: ScriptsSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>('en')
  const [expandedScript, setExpandedScript] = useState<string | null>(null)

  const scripts = {
    en: [
      {
        id: 'traffic-stop',
        title: 'Traffic Stop',
        scenario: 'When pulled over by police',
        script: 'Officer, I am exercising my right to remain silent. I do not consent to any searches. I want to speak with my attorney.',
        expanded: 'Here is what you should know about traffic stops:\n\n1. Keep your hands visible on the steering wheel\n2. Do not reach for anything unless asked\n3. Provide license, registration, and insurance when requested\n4. You are not required to answer questions beyond basic identification\n5. Politely assert your rights without being confrontational'
      },
      {
        id: 'police-contact',
        title: 'Police Contact',
        scenario: 'When approached by police on the street',
        script: 'Am I free to leave? If not, I am exercising my right to remain silent and request an attorney.',
        expanded: 'During police encounters:\n\n1. Stay calm and keep your hands visible\n2. Ask "Am I free to leave?" to establish if you\'re being detained\n3. If detained, clearly state you\'re exercising your right to remain silent\n4. Do not resist physically, even if you believe the stop is unlawful\n5. Remember details for later legal action'
      },
      {
        id: 'home-visit',
        title: 'Home Visit',
        scenario: 'When police come to your door',
        script: 'I do not consent to you entering my home. Please show me a warrant or leave your contact information.',
        expanded: 'When police come to your door:\n\n1. You are not required to open the door\n2. Speak through the door or a window\n3. Ask to see a warrant before allowing entry\n4. Without a warrant, you can refuse entry\n5. If they claim exigent circumstances, still clearly state you do not consent'
      }
    ],
    es: [
      {
        id: 'traffic-stop',
        title: 'Parada de Tráfico',
        scenario: 'Cuando te detiene la policía',
        script: 'Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento a ninguna búsqueda. Quiero hablar con mi abogado.',
        expanded: 'Esto es lo que debes saber sobre las paradas de tráfico:\n\n1. Mantén las manos visibles en el volante\n2. No alcances nada a menos que te lo pidan\n3. Proporciona licencia, registro y seguro cuando se solicite\n4. No estás obligado a responder preguntas más allá de la identificación básica\n5. Afirma cortésmente tus derechos sin ser confrontativo'
      },
      {
        id: 'police-contact',
        title: 'Contacto Policial',
        scenario: 'Cuando te aborda la policía en la calle',
        script: '¿Soy libre de irme? Si no, estoy ejerciendo mi derecho a permanecer en silencio y solicito un abogado.',
        expanded: 'Durante encuentros policiales:\n\n1. Mantén la calma y las manos visibles\n2. Pregunta "¿Soy libre de irme?" para establecer si estás siendo detenido\n3. Si estás detenido, declara claramente que ejerces tu derecho a permanecer en silencio\n4. No resistas físicamente, incluso si crees que la parada es ilegal\n5. Recuerda detalles para acción legal posterior'
      }
    ]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const currentScripts = scripts[selectedLanguage]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Legal Scripts</h2>
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

        <p className="text-white/80 mb-4">
          State-specific scripts for {state} to help you communicate your rights clearly and effectively.
        </p>

        {/* Language Selection */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white/70">
            <Globe className="h-4 w-4" />
            <span className="text-sm">Language:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-white text-gray-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('es')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                selectedLanguage === 'es'
                  ? 'bg-white text-gray-900'
                  : isPro 
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-gray-500 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isPro}
            >
              Español {!isPro && '(Pro)'}
            </button>
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {currentScripts.map((script) => (
          <div key={script.id} className="glass-effect rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{script.title}</h3>
                <p className="text-white/70 text-sm">{script.scenario}</p>
              </div>
              <button
                onClick={() => copyToClipboard(script.script)}
                className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mb-3">
              <p className="text-white font-medium">{script.script}</p>
            </div>

            <button
              onClick={() => setExpandedScript(
                expandedScript === script.id ? null : script.id
              )}
              className="flex items-center space-x-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              {expandedScript === script.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span>
                {expandedScript === script.id ? 'Hide' : 'Show'} detailed guidance
              </span>
            </button>

            {expandedScript === script.id && (
              <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <pre className="text-blue-100 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {script.expanded}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isPro && (
        <div className="glass-effect rounded-xl p-6 text-center space-y-4">
          <Star className="h-8 w-8 text-yellow-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Unlock More Scripts</h3>
          <p className="text-white/80">
            Get access to additional scenarios, multi-language support, and state-specific variations with Pro.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  )
}