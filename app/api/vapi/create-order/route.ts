import { NextResponse } from 'next/server';
import { orderService } from '@/app/services/order-service';

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

    // Vapi envoie les données dans le format "message.functionCall"
    const functionCall = body.message?.functionCall;
    
    if (!functionCall) {
      console.error('❌ Pas de functionCall dans le webhook');
      return NextResponse.json({ error: 'No function call data' }, { status: 400 });
    }

    const { name, parameters } = functionCall;

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
    if (!customerName || !items || items.length === 0) {
      console.error('❌ Données invalides:', { customerName, items });
      return NextResponse.json({ 
        error: 'customerName et items sont requis' 
      }, { status: 400 });
    }

    // Calculer le total
    const total = items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity), 
      0
    );

    // Créer la commande dans Firebase
    const orderData = {
      orderType: orderType || 'takeaway',
      customerName,
      customerPhone: customerPhone || '',
      tableNumber: tableNumber || null,
      items,
      totalPrice: total,
      notes: notes || '',
      status: 'pending' as const,
    };

    console.log('💾 Création de la commande:', orderData);

    const newOrder = await orderService.createOrder(orderData);

    console.log('✅ Commande créée avec succès:', newOrder.id);

    // Réponse à Vapi
    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: total,
      message: `Commande créée avec succès! Total: ${total} DA`,
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