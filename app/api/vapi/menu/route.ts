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
    // ✅ 1. Lire le body pour récupérer le toolCallId
    const body = await req.json();
    const toolCallId = body.message?.toolCallId || 'getMenu';
    
    console.log('📋 Récupération du menu, toolCallId:', toolCallId);

    // ✅ 2. Récupérer le menu depuis Firebase
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

    // ✅ 3. Formater le menu en texte
    const menuText = `MENU COMPLET DU RESTAURANT:

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 15} min)`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 2} min)`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 10} min)`).join('\n')}`;

    // ✅ 4. Retourner au FORMAT VAPI avec toolCallId
    return NextResponse.json({
      results: [
        {
          toolCallId: toolCallId,  // ← Renvoie le même ID
          result: menuText         // ← Contenu du menu
        }
      ]
    }, { 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    
    // ✅ Même en cas d'erreur, respecter le format Vapi
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
   