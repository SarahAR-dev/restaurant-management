"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, UtensilsCrossed, Wine, Leaf, ShoppingCart, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dishes", label: "Plats", icon: UtensilsCrossed },
  { href: "/drinks", label: "Boissons", icon: Wine },
  { href: "/sides", label: "Accompagnements", icon: Leaf },
  { href: "/orders", label: "Commandes", icon: ShoppingCart },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-sidebar-primary">Restaurant</h1>
            <p className="text-sm text-sidebar-foreground/60">Gestion</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
            <p>© 2025 Restaurant</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
