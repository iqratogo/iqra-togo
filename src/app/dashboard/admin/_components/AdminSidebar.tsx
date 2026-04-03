"use client"

/* §7 Sidebar Admin — navigation espace administration */

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  Heart,
  Settings,
  Image,
  LogOut,
  ChevronRight,
  UserRound,
  Mail,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/publications", label: "Publications", icon: FileText },
  { href: "/dashboard/admin/equipe", label: "Équipe", icon: UserRound },
  { href: "/dashboard/admin/membres", label: "Membres", icon: Users },
  { href: "/dashboard/admin/dons", label: "Dons", icon: Heart },
  { href: "/dashboard/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/dashboard/admin/medias", label: "Médiathèque", icon: Image },
  { href: "/dashboard/admin/parametres", label: "Paramètres", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-100 px-6 py-4">
        <Link href="/">
          <span
            className="font-[family-name:var(--font-playfair)] text-xl font-bold"
            style={{ color: "var(--azae-orange)" }}
          >
            IQRA TOGO
          </span>
        </Link>
        <p className="mt-0.5 text-xs text-gray-400">Administration</p>
      </div>

      {/* Navigation §7 */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navigation admin">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[var(--azae-orange)]"
                  )}
                  style={isActive ? { backgroundColor: "var(--azae-orange)" } : {}}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {label}
                  {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
        <Link
          href="/"
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:text-[var(--azae-orange)]"
        >
          ← Retour au site public
        </Link>
      </div>
    </aside>
  )
}
