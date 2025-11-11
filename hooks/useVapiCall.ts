
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
      console.log('Appel démarré');
      setIsCallActive(true);
      setError(null);
    });

    vapi.on('call-end', () => {
      console.log('Appel terminé');
      setIsCallActive(false);
      setIsSpeaking(false);
    });

    vapi.on('speech-start', () => {
      console.log('Client parle...');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('Client a fini de parler');
      setIsSpeaking(false);
    });

    vapi.on('error', (error: any) => {
      console.error('Erreur Vapi:', error);
      setError(error.message || 'Une erreur est survenue');
      setIsCallActive(false);
    });

    return () => {
      // Cleanup
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = async (assistantId: string) => {
    try {
      const vapi = getVapiClient();
      await vapi.start(assistantId);
    } catch (err: any) {
      console.error('Erreur au démarrage:', err);
      setError(err.message);
    }
  };

  const endCall = () => {
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

