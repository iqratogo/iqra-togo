/* §8 + §7.4 Cotisations membre */

"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

type Cotisation = {
  id: string
  period: string
  amount: number
  status: string
  dueDate: string
  paidAt: string | null
}

function CotisationsContent() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([])
  const [loading, setLoading] = useState(true)
  const [cotisationStatus, setCotisationStatus] = useState("")
  const [paying, setPaying] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const paid = searchParams.get("paid") === "1"

  useEffect(() => {
    fetch("/api/membre/cotisations")
      .then(r => r.json())
      .then(d => {
        setCotisations(d.cotisations ?? [])
        setCotisationStatus(d.cotisationStatus ?? "")
        setLoading(false)
      })
  }, [])

  async function handlePay(id: string) {
    setPaying(id)
    const res = await fetch("/api/membre/cotisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cotisationId: id }),
    })
    const data = await res.json()
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl
    } else {
      alert(data.error ?? "Erreur lors du paiement")
      setPaying(null)
    }
  }

  const STATUS = {
    SUCCESS: { label: "Payée", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
    PENDING: { label: "En attente", icon: Clock, cls: "bg-yellow-100 text-yellow-700" },
    FAILED: { label: "Échouée", icon: AlertCircle, cls: "bg-red-100 text-red-700" },
  } as const

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
          Mes cotisations
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Suivi et paiement de vos cotisations annuelles</p>
      </div>

      {paid && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Paiement effectué avec succès ! Votre cotisation a été enregistrée.</p>
        </div>
      )}

      {/* Statut global */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: cotisationStatus === "UP_TO_DATE" ? "var(--azae-green)" : "var(--azae-orange)" }}
          >
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {cotisationStatus === "UP_TO_DATE" ? "Cotisation à jour" :
               cotisationStatus === "LATE" ? "Cotisation en retard" :
               cotisationStatus === "EXEMPTED" ? "Exempté de cotisation" : "—"}
            </p>
            <p className="text-xs text-gray-500">Statut de votre cotisation annuelle</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Chargement…</div>
      ) : cotisations.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-gray-100 bg-white">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Aucune cotisation enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cotisations.map((c) => {
            const s = STATUS[c.status as keyof typeof STATUS] ?? STATUS.PENDING
            const SIcon = s.icon
            return (
              <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{c.period}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Échéance : {format(new Date(c.dueDate), "d MMMM yyyy", { locale: fr })}
                      {c.paidAt && ` · Payée le ${format(new Date(c.paidAt), "d MMMM yyyy", { locale: fr })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold" style={{ color: "var(--azae-navy)" }}>
                      {c.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", s.cls)}>
                      <SIcon className="h-3 w-3" />{s.label}
                    </span>
                    {c.status !== "SUCCESS" && (
                      <Button
                        size="sm"
                        onClick={() => handlePay(c.id)}
                        disabled={paying === c.id}
                        className="gap-1.5 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {paying === c.id ? "Redirection…" : "Payer"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CotisationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Chargement…</div>}>
      <CotisationsContent />
    </Suspense>
  )
}
