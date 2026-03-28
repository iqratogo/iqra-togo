"use client"

/* §5.4.1 Filtres projets — client pour interaction */

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  availableYears: number[]
  currentAnnee?: number
}

export default function ProjetsFilters({ availableYears, currentAnnee }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = (annee?: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    if (annee) {
      params.set("annee", String(annee))
    } else {
      params.delete("annee")
    }
    router.push(`/actualites/projets?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setFilter()}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          !currentAnnee
            ? "text-white"
            : "border border-gray-200 bg-white text-gray-600 hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
        )}
        style={!currentAnnee ? { backgroundColor: "var(--azae-orange)" } : {}}
      >
        Toutes les années
      </button>
      {availableYears.map((year) => (
        <button
          key={year}
          onClick={() => setFilter(year)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            currentAnnee === year
              ? "text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
          )}
          style={currentAnnee === year ? { backgroundColor: "var(--azae-orange)" } : {}}
        >
          {year}
        </button>
      ))}
    </div>
  )
}
