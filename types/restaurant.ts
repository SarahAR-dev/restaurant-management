export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: "entree" | "plat" | "dessert" | "boisson" | "accompagnement"
  available: boolean
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  orderType: 'dine-in' | 'takeout';
  total: number
  createdAt: Date
  updatedAt: Date
  tableNumber?: number
  customerName?: string
  customerPhone?: string
  notes?: string
}

export interface OrderItem {
  menuItemId: string
  menuItemName: string
  quantity: number
  price: number
  notes?: string
}

export interface VapiInteraction {
  id: string
  orderId?: string
  transcript: string
  intent: "order" | "inquiry" | "complaint" | "other"
  sentiment: "positive" | "neutral" | "negative"
  createdAt: Date
  response: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  openingHours: {
    [key: string]: { open: string; close: string }
  }
  createdAt: Date
  updatedAt: Date
}
