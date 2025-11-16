import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/app/services/settings-service';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur GET settings:', error);
    return NextResponse.json(
      { error: 'Erreur récupération paramètres' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { pickupTime, deliveryTime } = await req.json();

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

    await saveSettings(pickupTime, deliveryTime);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST settings:', error);
    return NextResponse.json(
      { error: 'Erreur sauvegarde paramètres' },
      { status: 500 }
    );
  }
}