import { NextResponse } from 'next/server';
import { getDishes, getDrinks, getSides } from '@/app/services/menu-service';

// ✅ CORS Headers pour Vapi
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ OPTIONS pour CORS preflight
export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function POST(req: Request) {
  try {
    // ✅ Lire le body de manière sécurisée
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    
    // ✅ LOG pour debug
    console.log('📥 Body reçu de Vapi:', JSON.stringify(body));
    
    const toolCallId = body.message?.toolCallId || body.toolCallId || 'getMenu';
    
    console.log('📋 Récupération du menu, toolCallId:', toolCallId);

    const [dishes, drinks, sides] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
    ]);

    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    console.log('✅ Menu récupéré:', {
      plats: availableDishes.length,
      boissons: availableDrinks.length,
      accompagnements: availableSides.length
    });

    const menuText = `MENU COMPLET DU RESTAURANT:

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 15} min)`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 2} min)`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 10} min)`).join('\n')}`;

    // ✅ LOG pour voir ce qu'on retourne
    const response = {
      results: [
        {
          toolCallId: toolCallId,
          result: menuText
        }
      ]
    };
    
    console.log('📤 Réponse envoyée à Vapi:', JSON.stringify(response).substring(0, 200) + '...');

    return NextResponse.json(response, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur complète:', error);
    
    return NextResponse.json({
      results: [
        {
          toolCallId: 'getMenu',
          result: 'Désolé, impossible de récupérer le menu pour le moment.'
        }
      ]
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}