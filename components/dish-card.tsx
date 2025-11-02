"use client"

import { Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Dish {
  id: number
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image: string
}

interface DishCardProps {
  dish: Dish
  onToggleAvailability: (id: number) => void
  onDelete: (id: number) => void
}

export function DishCard({ dish, onToggleAvailability, onDelete }: DishCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        <Image src={dish.image || "/placeholder.svg"} alt={dish.name} fill className="object-cover" />
        {/* Badge de disponibilité */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onToggleAvailability(dish.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              dish.available
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }`}
          >
            {dish.available ? "Disponible" : "Indisponible"}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{dish.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{dish.description}</p>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${dish.price.toFixed(2)}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">{dish.category}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
            <Edit2 className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 text-destructive hover:text-destructive bg-transparent"
            onClick={() => onDelete(dish.id)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}
