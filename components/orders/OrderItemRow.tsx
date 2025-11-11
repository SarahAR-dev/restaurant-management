"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Trash2, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface MenuItem {
  id: string
  name: string
  price: number
  category?: string
}

interface OrderItemRowProps {
  item: OrderItem
  index: number
  availableItems: MenuItem[]
  onUpdateItem: (index: number, itemId: string) => void
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
}

export function OrderItemRow({ 
  item, 
  index, 
  availableItems, 
  onUpdateItem, 
  onUpdateQuantity, 
  onRemoveItem 
}: OrderItemRowProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  // Calcul automatique du total
  const total = useMemo(() => {
    return item.quantity * item.price
  }, [item.quantity, item.price])

  // Filtrer les items par catégorie et recherche
  const filteredItems = availableItems.filter((menuItem) => {
    const matchesCategory = !selectedCategory || menuItem.category === selectedCategory
    const matchesSearch = !searchQuery || 
      menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sélectionner un article
  const handleSelectItem = (menuItem: MenuItem) => {
    onUpdateItem(index, menuItem.id)
    setSearchQuery("")
    setShowSuggestions(false)
  }

  // Réinitialiser la sélection
  const handleResetItem = () => {
    onUpdateItem(index, "")
    setSearchQuery("")
    setShowSuggestions(false)
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      {/* Si aucun article n'est sélectionné */}
      {!item.name && (
        <>
          {/* Étape 1: Sélection de la catégorie */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">1️⃣ Choisir une catégorie</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value)
                setSearchQuery("")
                setShowSuggestions(false)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plat">🍽️ Plats</SelectItem>
                <SelectItem value="Boisson">🥤 Boissons</SelectItem>
                <SelectItem value="Accompagnement">🍟 Accompagnements</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Étape 2: Recherche en temps réel */}
          {selectedCategory && (
            <div className="grid gap-2">
              <Label className="text-sm font-medium">2️⃣ Rechercher et sélectionner</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  placeholder={`Taper pour rechercher dans ${selectedCategory}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10"
                />
                
                {/* Suggestions en temps réel */}
                {showSuggestions && searchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((menuItem) => (
                        <button
                          key={menuItem.id}
                          type="button"
                          onClick={() => handleSelectItem(menuItem)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <p className="font-medium">{menuItem.name}</p>
                          <p className="text-sm text-muted-foreground">{menuItem.price} DA</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Aucun article trouvé pour "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bouton supprimer si pas d'article sélectionné */}
          <div className="flex justify-end pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </>
      )}

      {/* Si un article est sélectionné */}
      {item.name && (
        <>
          {/* Affichage de l'article sélectionné */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">✅ Article sélectionné</p>
                <p className="text-lg font-semibold mt-1">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.price} DA l'unité</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetItem}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quantité et Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Quantité</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
                className="text-lg font-medium"
              />
            </div>
            <div>
              <Label className="text-sm">Total</Label>
              <div className="h-10 flex items-center">
                <p className="text-2xl font-bold text-primary">
                  {total} DA
                </p>
              </div>
            </div>
          </div>

          {/* Résumé et bouton supprimer */}
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              {item.quantity} × {item.price} DA = {total} DA
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}