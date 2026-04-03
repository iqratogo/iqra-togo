"use client"

/* §7.7 Paramètres globaux admin */

import { useState, useEffect } from "react"
import { Save, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const SETTINGS_FIELDS = [
  {
    section: "Site",
    fields: [
      { key: "site_name", label: "Nom du site", type: "text", placeholder: "IQRA TOGO" },
      { key: "site_description", label: "Description", type: "textarea", placeholder: "association IQRA TOGO — Agir ensemble pour le Togo" },
      { key: "contact_email", label: "Email de contact", type: "email", placeholder: "contact@iqra-togo.com" },
      { key: "contact_phone", label: "Téléphone", type: "text", placeholder: "+228 XX XX XX XX" },
      { key: "contact_address", label: "Adresse", type: "text", placeholder: "Quartier Limamwa, Tchamba" },
    ],
  },
  {
    section: "Réseaux sociaux",
    fields: [
      { key: "social_facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/iqratogo" },
      { key: "social_instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/iqratogo" },
      { key: "social_twitter", label: "X / Twitter", type: "url", placeholder: "https://x.com/iqratogo" },
      { key: "social_youtube", label: "YouTube", type: "url", placeholder: "https://youtube.com/@iqratogo" },
      { key: "social_whatsapp", label: "WhatsApp", type: "text", placeholder: "+228XXXXXXXX" },
    ],
  },
  {
    section: "Dons",
    fields: [
      { key: "don_objectif_annuel", label: "Objectif annuel (FCFA)", type: "number", placeholder: "5000000" },
      { key: "don_message_merci", label: "Message de remerciement", type: "textarea", placeholder: "Merci pour votre générosité…" },
    ],
  },
  {
    section: "Cotisations",
    fields: [
      { key: "cotisation_montant", label: "Montant annuel (FCFA)", type: "number", placeholder: "5000" },
      { key: "cotisation_date_limite", label: "Date limite (MM-JJ)", type: "text", placeholder: "12-31" },
    ],
  },
]

export default function ParametresAdmin() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/parametres")
      .then(r => r.json())
      .then(data => { setValues(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    const res = await fetch("/api/admin/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Erreur lors de la sauvegarde")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="p-6 lg:p-8 text-center text-sm text-gray-400">Chargement…</div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Paramètres
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Configuration globale du site</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Enregistré !" : saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}

      <div className="space-y-8">
        {SETTINGS_FIELDS.map(({ section, fields }) => (
          <div key={section}>
            <h2 className="mb-4 font-semibold text-gray-800 border-b border-gray-100 pb-2">{section}</h2>
            <div className="space-y-4">
              {fields.map(({ key, label, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  {type === "textarea" ? (
                    <Textarea
                      value={values[key] ?? ""}
                      onChange={(e) => setValues(v => ({ ...v, [key]: e.target.value }))}
                      placeholder={placeholder}
                      rows={3}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      type={type}
                      value={values[key] ?? ""}
                      onChange={(e) => setValues(v => ({ ...v, [key]: e.target.value }))}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Enregistré !" : saving ? "Enregistrement…" : "Enregistrer les paramètres"}
        </Button>
      </div>
    </div>
  )
}
