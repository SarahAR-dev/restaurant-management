import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'restaurant_settings';

export interface RestaurantSettings {
  pickupTime: number;
  deliveryTime: number;
  updatedAt?: string;
}

// ✅ Récupérer les paramètres
export async function getSettings(): Promise<RestaurantSettings> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as RestaurantSettings;
    }
    
    return {
      pickupTime: 25,
      deliveryTime: 25,
    };
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    return {
      pickupTime: 25,
      deliveryTime: 25,
    };
  }
}

// ✅ Sauvegarder les paramètres
export async function saveSettings(pickupTime: number, deliveryTime: number) {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, {
      pickupTime,
      deliveryTime,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur sauvegarde settings:', error);
    throw error;
  }
}