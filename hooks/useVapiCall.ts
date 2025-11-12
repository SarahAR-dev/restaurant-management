'use client';

import { useState, useEffect } from 'react';
import { getVapiClient } from '@/lib/vapi-client';

export const useVapiCall = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapi = getVapiClient();

    // Événements Vapi
    vapi.on('call-start', () => {
      console.log('✅ Appel démarré');
      setIsCallActive(true);
      setError(null);
    });

    vapi.on('call-end', () => {
      console.log('🔴 Appel terminé');
      setIsCallActive(false);
      setIsSpeaking(false);
    });

    vapi.on('speech-start', () => {
      console.log('🎤 Client parle...');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('🔇 Client a fini de parler');
      setIsSpeaking(false);
    });

    vapi.on('error', (error: any) => {
      console.error('❌ Erreur Vapi COMPLÈTE:', {
        message: error?.message,
        error: error,
        type: typeof error,
        keys: error ? Object.keys(error) : [],
        stringified: JSON.stringify(error, null, 2)
      });
      setError(error?.message || JSON.stringify(error) || 'Une erreur est survenue');
      setIsCallActive(false);
    });

    vapi.on('message', (message: any) => {
      console.log('📨 Message Vapi:', message);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = async (assistantId: string) => {
    try {
      console.log('🚀 Tentative de démarrage avec Assistant ID:', assistantId);
      const vapi = getVapiClient();
      
      console.log('📞 Appel de vapi.start()...');
      const result = await vapi.start(assistantId);
      console.log('✅ Résultat vapi.start():', result);
      
    } catch (err: any) {
      console.error('❌ Erreur au démarrage COMPLÈTE:', {
        message: err?.message,
        error: err,
        stack: err?.stack,
        type: typeof err,
        keys: err ? Object.keys(err) : [],
        stringified: JSON.stringify(err, null, 2)
      });
      setError(err?.message || JSON.stringify(err) || 'Erreur de démarrage');
    }
  };

  const endCall = () => {
    console.log('🛑 Arrêt de l\'appel');
    const vapi = getVapiClient();
    vapi.stop();
  };

  return {
    isCallActive,
    isSpeaking,
    error,
    startCall,
    endCall,
  };
};