
import Vapi from '@vapi-ai/web';

let vapiInstance: Vapi | null = null;

export const getVapiClient = () => {
  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined');
    }
    
    vapiInstance = new Vapi(publicKey);
  }
  
  return vapiInstance;
};

export default getVapiClient;