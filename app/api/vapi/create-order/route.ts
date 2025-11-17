import { NextResponse } from 'next/server';
import { orderService } from '@/app/services/order-service';
import { getDishes, getDrinks, getSides } from '@/app/services/menu-service';


export async function POST(req: Request) {
  try {
    // Vérifier la clé privée Vapi
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.VAPI_PRIVATE_KEY;

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      console.error('❌ Clé Vapi invalide');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
console.log('📥 Webhook Vapi reçu:', JSON.stringify(body, null, 2));

   // Vapi envoie les données dans "message.toolCalls"
const toolCalls = body.message?.toolCalls;

if (!toolCalls || toolCalls.length === 0) {
  console.error('❌ Pas de toolCalls dans le webhook');
  return NextResponse.json({ error: 'No tool calls data' }, { status: 400 });
}

const toolCall = toolCalls[0]; // Premier tool call
const { id, function: func } = toolCall;
const { name, arguments: parameters } = func;

// Vérifier que c'est bien un appel pour créer une commande
if (name !== 'createOrder') {
  console.error('❌ Function name incorrect:', name);
  return NextResponse.json({ error: 'Invalid function name' }, { status: 400 });
}

console.log('📋 Paramètres de la commande:', parameters);

// Extraire les données de la commande
const {
  orderType,
  customerName,
  customerPhone,
  tableNumber,
  items,
  notes,
} = parameters;

    // Validation
// Validation des items
if (!items || items.length === 0) {
  console.error('❌ Données invalides:', { items });
  return NextResponse.json({ 
    error: 'items est requis' 
  }, { status: 400 });
}

// Validation pour commande SUR PLACE
if (orderType === 'sur_place') {
  if (!tableNumber) {
    console.error('❌ Numéro de table manquant pour commande sur place');
    return NextResponse.json({ 
      error: 'tableNumber est requis pour les commandes sur place' 
    }, { status: 400 });
  }
}

// Validation pour commande À EMPORTER
if (orderType === 'a_emporter') {
  if (!customerName) {
    console.error('❌ Nom client manquant pour commande à emporter');
    return NextResponse.json({ 
      error: 'customerName est requis pour les commandes à emporter' 
    }, { status: 400 });
  }
  if (!customerPhone) {
    console.error('❌ Téléphone manquant pour commande à emporter');
    return NextResponse.json({ 
      error: 'customerPhone est requis pour les commandes à emporter' 
    }, { status: 400 });
  }
}

// Récupérer les prix depuis Firebase
const dishes: any[] = await getDishes();
const drinks: any[] = await getDrinks();
const sides: any[] = await getSides();

// Combiner tous les items du menu
const allMenuItems: any[] = [...dishes, ...drinks, ...sides];

// Enrichir les items avec les prix
const enrichedItems = items.map((item: any) => {
  const menuItem = allMenuItems.find(
    (mi) => mi.name.toLowerCase() === item.name.toLowerCase()
  );
  
  return {
    ...item,
    price: menuItem?.price || 0,
  };
});

// Calculer le total avec les prix enrichis
const total = enrichedItems.reduce(
  (sum: number, item: any) => sum + (item.price * item.quantity), 
  0
);

    // Créer la commande dans Firebase
  // Convertir le type de commande
const finalOrderType: 'takeout' | 'dine-in' = orderType === 'a_emporter' ? 'takeout' : 'dine-in';

const orderData: any = {
  orderType: finalOrderType,
  customerName: customerName || 'Client sur place',  // Nom ou défaut pour sur place
  customerPhone: customerPhone || '',  // Téléphone (vide si sur place)
  tableNumber: tableNumber || null,  // Numéro de table (null si à emporter)
  items: enrichedItems,
  totalPrice: total,
  notes: notes || '',
  status: 'pending' as const,
};

    console.log('💾 Création de la commande:', orderData);

    const newOrder = await orderService.createOrder(orderData);

    console.log('✅ Commande créée avec succès:', newOrder.id);

    // Réponse à Vapi
    return NextResponse.json({
  results: [{
    toolCallId: id,  // ✅ Utilise l'id du toolCall
    result: `Commande créée avec succès pour ${customerName}! Total: ${total} DA. Numéro de commande: ${newOrder.id}`
  }]
});

  } catch (error) {
    console.error('❌ Erreur webhook Vapi:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la commande',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/// pour tester l url
export async function GET(req: Request) {
  return NextResponse.json({
    results: [{
      toolCallId: "test_123",
      result: "✅ API create-order fonctionne! Cette route accepte les requêtes POST de Vapi."
    }]
  });
}