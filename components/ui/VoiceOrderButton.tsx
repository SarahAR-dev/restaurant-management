'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVapiCall } from '@/hooks/useVapiCall';

interface VoiceOrderButtonProps {
  assistantId: string;
}

export const VoiceOrderButton = ({ assistantId }: VoiceOrderButtonProps) => {
  const { isCallActive, isSpeaking, error, startCall, endCall } = useVapiCall();

  const handleClick = () => {
    if (isCallActive) {
      endCall();
    } else {
      startCall(assistantId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleClick}
        size="lg"
        variant={isCallActive ? "destructive" : "default"}
        className={`relative gap-2 ${isSpeaking ? 'animate-pulse' : ''}`}
      >
        {isCallActive ? (
          <>
            <MicOff className="h-5 w-5" />
            Terminer l'appel
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            Commande vocale
          </>
        )}
        
        {/* Indicateur visuel quand le client parle */}
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </Button>

      {/* Message d'erreur */}
      {error && (
        <p className="text-sm text-red-500 text-center max-w-xs">
          {error}
        </p>
      )}

      {/* Statut de l'appel */}
      {isCallActive && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isSpeaking ? 'Vous parlez...' : 'En écoute...'}</span>
        </div>
      )}
    </div>
  );
};