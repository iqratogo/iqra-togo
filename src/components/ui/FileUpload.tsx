"use client"

/* Composant réutilisable d'upload de fichier vers /api/admin/upload */

import { useRef, useState } from "react"
import { Upload, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (url: string, name: string) => void
  accept?: string
  label?: string
  className?: string
  currentUrl?: string
}

export default function FileUpload({
  onUpload,
  accept = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.md,.txt",
  label = "Téléverser un fichier",
  className,
  currentUrl,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setUploaded(false)

    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const json = await res.json()

    setUploading(false)

    if (!res.ok) {
      setError(json.error ?? "Erreur d'upload")
      return
    }

    setUploaded(true)
    onUpload(json.url, json.name)
    // Reset input so same file can be re-uploaded if needed
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm font-medium transition-colors",
          uploading
            ? "cursor-not-allowed border-gray-200 text-gray-400"
            : "border-[var(--azae-orange)] text-[var(--azae-orange)] hover:bg-orange-50"
        )}
      >
        {uploading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--azae-orange)] border-t-transparent" />
            Envoi en cours…
          </>
        ) : uploaded ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            Fichier envoyé
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {label}
          </>
        )}
      </button>
      {currentUrl && (
        <p className="truncate text-xs text-gray-400" title={currentUrl}>
          Actuel : {currentUrl}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
