import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'restaurant_settings';

// Récupérer les temps de préparation
export async function GET() {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    }
    
    // Valeurs par défaut si aucun paramètre
    return NextResponse.json({
      pickupTime: 25,
      deliveryTime: 25,
    });
  } catch (error) {
    console.error('Erreur GET settings:', error);
    return NextResponse.json(
      { error: 'Erreur récupération paramètres' },
      { status: 500 }
    );
  }
}

// Sauvegarder les temps de préparation
export async function POST(req: Request) {
  try {
    const { pickupTime, deliveryTime } = await req.json();

    // Validation
    if (pickupTime < 5 || pickupTime > 90) {
      return NextResponse.json(
        { error: 'pickupTime doit être entre 5 et 90' },
        { status: 400 }
      );
    }

    if (deliveryTime < 5 || deliveryTime > 90) {
      return NextResponse.json(
        { error: 'deliveryTime doit être entre 5 et 90' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, {
      pickupTime,
      deliveryTime,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST settings:', error);
    return NextResponse.json(
      { error: 'Erreur sauvegarde paramètres' },
      { status: 500 }
    );
  }
}