/* API Upload fichiers — images, vidéos, documents (Supabase Storage) */

import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { randomBytes } from "crypto"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

const MAX_SIZE = 50 * 1024 * 1024 // 50 Mo

/* Mapping MIME → { dossier, extension, magic bytes attendus (null = pas de check) } */
const MIME_CONFIG: Record<string, { folder: string; ext: string; magic: number[] | null }> = {
  "image/jpeg":    { folder: "images",    ext: "jpg",  magic: [0xff, 0xd8, 0xff] },
  "image/jpg":     { folder: "images",    ext: "jpg",  magic: [0xff, 0xd8, 0xff] },
  "image/png":     { folder: "images",    ext: "png",  magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp":    { folder: "images",    ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  "image/gif":     { folder: "images",    ext: "gif",  magic: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  "image/svg+xml": { folder: "images",    ext: "svg",  magic: null }, // texte XML
  "video/mp4":     { folder: "videos",    ext: "mp4",  magic: null }, // ftyp à offset 4, skip
  "video/webm":    { folder: "videos",    ext: "webm", magic: [0x1a, 0x45, 0xdf, 0xa3] },
  "video/ogg":     { folder: "videos",    ext: "ogv",  magic: [0x4f, 0x67, 0x67, 0x53] }, // OggS
  "application/pdf": { folder: "documents", ext: "pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  "application/msword":        { folder: "documents", ext: "doc",  magic: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE2
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                               { folder: "documents", ext: "docx", magic: [0x50, 0x4b, 0x03, 0x04] }, // ZIP
  "application/vnd.ms-excel":  { folder: "documents", ext: "xls",  magic: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE2
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                               { folder: "documents", ext: "xlsx", magic: [0x50, 0x4b, 0x03, 0x04] }, // ZIP
  "text/markdown": { folder: "documents", ext: "md",   magic: null },
  "text/plain":    { folder: "documents", ext: "txt",  magic: null },
}

/** Vérifie que les premiers octets du buffer correspondent aux magic bytes attendus */
function hasMagicBytes(buf: Buffer, magic: number[]): boolean {
  if (buf.length < magic.length) return false
  return magic.every((byte, i) => buf[i] === byte)
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis")
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 50 Mo)" }, { status: 400 })
  }

  const config = MIME_CONFIG[file.type]
  if (!config) {
    return NextResponse.json({ error: `Type de fichier non autorisé : ${file.type}` }, { status: 400 })
  }

  /* Lire le buffer une seule fois pour les magic bytes + upload */
  const buffer = Buffer.from(await file.arrayBuffer())

  /* Vérification magic bytes côté serveur (indépendant du client) */
  if (config.magic !== null && !hasMagicBytes(buffer, config.magic)) {
    return NextResponse.json(
      { error: "Contenu du fichier incohérent avec le type déclaré." },
      { status: 400 }
    )
  }

  /* Extension dérivée du MIME serveur, jamais du nom client */
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${config.ext}`
  const storagePath = `${config.folder}/${filename}`

  try {
    const supabase = getSupabaseAdmin()

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError)
      return NextResponse.json({ error: "Erreur lors de l'upload du fichier." }, { status: 500 })
    }

    const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(storagePath)

    return NextResponse.json({
      url: publicData.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Erreur serveur lors de l'upload." }, { status: 500 })
  }
}
