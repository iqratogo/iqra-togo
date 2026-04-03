/* §8 Profil membre — consultation + mise à jour */

import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import ProfilForm from "./_components/ProfilForm"

export const metadata: Metadata = { title: "Mon profil — IQRA TOGO" }

export default async function ProfilPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const userId = (session.user as { id: string }).id
  const member = await prisma.member.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  })

  if (!member) redirect("/dashboard/membre")

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
          Mon profil
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Gérez vos informations personnelles</p>
      </div>
      <ProfilForm member={{
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone ?? "",
        country: member.country,
        city: member.city ?? "",
        neighborhood: member.neighborhood ?? "",
        profession: member.profession ?? "",
        employer: member.employer ?? "",
        email: member.user.email,
        memberNumber: member.memberNumber,
      }} />
    </div>
  )
}
