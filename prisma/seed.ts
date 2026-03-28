import {
  PrismaClient,
  UserRole,
  UserStatus,
  MemberStatus,
  CotisationStatus,
  PostStatus,
  PostCategory,
  PartnerType,
  Department,
  DonationStatus,
  DonationAffectation,
  DonationType,
} from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

/* Seed : utilise DIRECT_URL (connexion directe) pour éviter les poolers */
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash("Azae2025!", 12)

  // ── Utilisateurs ──────────────────────────────────────────
  console.log("🌱 Seeding utilisateurs...")

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@azaetogo.com" },
    update: {},
    create: {
      name: "Super Admin AZAE",
      email: "superadmin@azaetogo.com",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@azaetogo.com" },
    update: {},
    create: {
      name: "Admin AZAE",
      email: "admin@azaetogo.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: "editeur@azaetogo.com" },
    update: {},
    create: {
      name: "Éditeur AZAE",
      email: "editeur@azaetogo.com",
      password: hashedPassword,
      role: UserRole.EDITOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const membreUser = await prisma.user.upsert({
    where: { email: "membre@azaetogo.com" },
    update: {},
    create: {
      name: "Kofi Mensah",
      email: "membre@azaetogo.com",
      password: hashedPassword,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const membre2User = await prisma.user.upsert({
    where: { email: "membre2@azaetogo.com" },
    update: {},
    create: {
      name: "Ama Koffi",
      email: "membre2@azaetogo.com",
      password: hashedPassword,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const visiteurUser = await prisma.user.upsert({
    where: { email: "visiteur@azaetogo.com" },
    update: {},
    create: {
      name: "Jean Visiteur",
      email: "visiteur@azaetogo.com",
      password: hashedPassword,
      role: UserRole.VISITOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  console.log("✅ Utilisateurs créés:")
  console.log("   SUPER_ADMIN : superadmin@azaetogo.com")
  console.log("   ADMIN       : admin@azaetogo.com")
  console.log("   EDITOR      : editeur@azaetogo.com")
  console.log("   MEMBER      : membre@azaetogo.com")
  console.log("   MEMBER      : membre2@azaetogo.com")
  console.log("   VISITOR     : visiteur@azaetogo.com")
  console.log("   Mot de passe commun : Azae2025!")

  // ── Profils membres ───────────────────────────────────────
  console.log("\n🌱 Seeding profils membres...")

  const membre1 = await prisma.member.upsert({
    where: { userId: membreUser.id },
    update: {},
    create: {
      userId: membreUser.id,
      memberNumber: "AZAE-0001",
      civility: "M",
      firstName: "Kofi",
      lastName: "Mensah",
      phone: "+22890000001",
      country: "Togo",
      city: "Lomé",
      neighborhood: "Bè Kpota",
      profession: "Enseignant",
      status: MemberStatus.ACTIVE,
      cotisationStatus: CotisationStatus.UP_TO_DATE,
      joinedAt: new Date("2024-01-15"),
      cotisationDueDate: new Date("2026-12-31"),
    },
  })

  const membre2 = await prisma.member.upsert({
    where: { userId: membre2User.id },
    update: {},
    create: {
      userId: membre2User.id,
      memberNumber: "AZAE-0002",
      civility: "MME",
      firstName: "Ama",
      lastName: "Koffi",
      phone: "+22890000002",
      country: "Togo",
      city: "Lomé",
      neighborhood: "Agoè",
      profession: "Infirmière",
      status: MemberStatus.ACTIVE,
      cotisationStatus: CotisationStatus.LATE,
      joinedAt: new Date("2024-06-01"),
      cotisationDueDate: new Date("2025-12-31"),
    },
  })

  // Cotisations pour les membres
  await prisma.cotisation.upsert({
    where: { id: "seed-cotis-1" },
    update: {},
    create: {
      id: "seed-cotis-1",
      memberId: membre1.id,
      amount: 10000,
      period: "2025",
      status: DonationStatus.SUCCESS,
      paidAt: new Date("2025-01-10"),
      dueDate: new Date("2025-12-31"),
    },
  })

  await prisma.cotisation.upsert({
    where: { id: "seed-cotis-2" },
    update: {},
    create: {
      id: "seed-cotis-2",
      memberId: membre2.id,
      amount: 10000,
      period: "2025",
      status: DonationStatus.PENDING,
      dueDate: new Date("2025-03-31"),
    },
  })

  console.log("✅ Profils membres créés : AZAE-0001 (Kofi Mensah), AZAE-0002 (Ama Koffi)")

  // ── Candidature en attente ─────────────────────────────────
  console.log("\n🌱 Seeding candidature...")

  await prisma.membershipApplication.upsert({
    where: { userId: visiteurUser.id },
    update: {},
    create: {
      userId: visiteurUser.id,
      dossierNumber: "DOSSIER-0001",
      civility: "M",
      firstName: "Jean",
      lastName: "Visiteur",
      email: "visiteur@azaetogo.com",
      phone: "+22890000003",
      country: "Togo",
      city: "Lomé",
      profession: "Étudiant",
      motivation: "Je souhaite rejoindre Azaetogo pour contribuer à l'éducation des enfants au Togo.",
      status: "pending",
      rgpdConsent: true,
      rulesAccepted: true,
    },
  })

  console.log("✅ Candidature créée : DOSSIER-0001 (Jean Visiteur — en attente)")

  // ── Publications ──────────────────────────────────────────
  console.log("\n🌱 Seeding publications...")

  const posts = [
    {
      id: "seed-post-1",
      title: "Construction d'une école à Tsévié",
      slug: "construction-ecole-tsevie",
      excerpt: "Azaetogo inaugure sa nouvelle école primaire dans la région de Tsévié, offrant à 200 enfants l'accès à l'éducation.",
      content: "<p>Azaetogo est fière d'annoncer l'inauguration de l'école primaire de Tsévié. Ce projet, financé grâce aux dons de nos généreux donateurs, permettra à plus de 200 enfants d'accéder à une éducation de qualité.</p><p>La construction a duré 8 mois et a mobilisé des artisans locaux, contribuant ainsi à l'économie de la région.</p>",
      category: PostCategory.PROJET,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-03-01"),
      authorId: superAdmin.id,
      seoTitle: "Construction école Tsévié — Azaetogo",
      seoDescription: "Azaetogo inaugure une école primaire à Tsévié pour 200 enfants. Découvrez ce projet éducatif au Togo.",
    },
    {
      id: "seed-post-2",
      title: "Distribution de fournitures scolaires 2025",
      slug: "distribution-fournitures-scolaires-2025",
      excerpt: "450 étudiants ont reçu leurs kits scolaires pour la rentrée 2025. Retour en images sur cette journée mémorable.",
      content: "<p>Pour la rentrée scolaire 2025, Azaetogo a organisé une grande distribution de fournitures scolaires au profit de 450 étudiants issus de familles défavorisées.</p><p>Cahiers, stylos, sacs, uniformes… tout a été prévu pour que ces enfants puissent aborder l'année scolaire dans les meilleures conditions.</p>",
      category: PostCategory.ACTUALITE,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-02-15"),
      authorId: admin.id,
      seoTitle: "Fournitures scolaires 2025 — Azaetogo",
      seoDescription: "450 étudiants ont reçu leurs kits scolaires grâce à Azaetogo. Une action concrète pour l'éducation au Togo.",
    },
    {
      id: "seed-post-3",
      title: "Partenariat avec la Commune de Lomé",
      slug: "partenariat-commune-lome",
      excerpt: "Azaetogo signe un accord de partenariat avec la Commune de Lomé pour développer des programmes sociaux.",
      content: "<p>Un accord de partenariat stratégique a été signé entre Azaetogo et la Commune de Lomé. Cet accord permettra de mettre en place des programmes conjoints en faveur des familles vulnérables de la capitale togolaise.</p>",
      category: PostCategory.PARTENAIRE,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-01-20"),
      authorId: superAdmin.id,
    },
    {
      id: "seed-post-4",
      title: "Programme d'aide alimentaire hivernale",
      slug: "programme-aide-alimentaire",
      excerpt: "Brouillon — campagne d'aide alimentaire prévue pour Q2 2025.",
      content: "<p>En cours de rédaction…</p>",
      category: PostCategory.ACTUALITE,
      status: PostStatus.DRAFT,
      authorId: admin.id,
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: post,
    })
  }

  console.log(`✅ ${posts.length} publications créées`)

  // ── Partenaires ───────────────────────────────────────────
  console.log("\n🌱 Seeding partenaires...")

  const partners = [
    { id: "seed-partner-1", name: "Dar ul-Funun", logoUrl: "/partner_logo/daru_l-f%C3%BCnun.svg", type: PartnerType.INSTITUTIONNEL, displayOrder: 1 },
    { id: "seed-partner-2", name: "Commune de Lomé", logoUrl: "/partner_logo/logo_commune.svg", type: PartnerType.INSTITUTIONNEL, displayOrder: 2 },
    { id: "seed-partner-3", name: "Love Foundation", logoUrl: "/partner_logo/Logo_love.svg", type: PartnerType.FINANCIER, displayOrder: 3 },
    { id: "seed-partner-4", name: "Saudi Development", logoUrl: "/partner_logo/Logo_saud.svg", type: PartnerType.FINANCIER, displayOrder: 4 },
    { id: "seed-partner-5", name: "Tut Elimi", logoUrl: "/partner_logo/tut-elimi.svg", type: PartnerType.TECHNIQUE, displayOrder: 5 },
  ]

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: { logoUrl: partner.logoUrl, isActive: true },
      create: { ...partner, isActive: true },
    })
  }

  console.log(`✅ ${partners.length} partenaires créés`)

  // ── Équipe ────────────────────────────────────────────────
  console.log("\n🌱 Seeding équipe...")

  const teamMembers = [
    {
      id: "seed-team-1",
      firstName: "Amara",
      lastName: "Diallo",
      position: "Président Fondateur",
      department: Department.DIRECTION,
      bio: "Fondateur d'Azaetogo en 2010, Amara Diallo œuvre depuis 15 ans pour l'éducation et la dignité des familles togolaises.",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "seed-team-2",
      firstName: "Fatou",
      lastName: "Traoré",
      position: "Directrice des Programmes",
      department: Department.PROGRAMMES,
      bio: "Responsable de la coordination des projets éducatifs et sociaux sur le terrain depuis 2015.",
      displayOrder: 2,
      isActive: true,
    },
    {
      id: "seed-team-3",
      firstName: "Kwame",
      lastName: "Asante",
      position: "Responsable Communication",
      department: Department.COMMUNICATION,
      bio: "Chargé de la visibilité de l'association et de la relation avec les donateurs et partenaires.",
      displayOrder: 3,
      isActive: true,
    },
    {
      id: "seed-team-4",
      firstName: "Esi",
      lastName: "Boateng",
      position: "Responsable Financier",
      department: Department.FINANCE,
      bio: "Garante de la transparence financière et du suivi des dons et cotisations.",
      displayOrder: 4,
      isActive: true,
    },
  ]

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: member.id },
      update: {},
      create: member,
    })
  }

  console.log(`✅ ${teamMembers.length} membres d'équipe créés`)

  // ── Dons ──────────────────────────────────────────────────
  console.log("\n🌱 Seeding dons...")

  const donations = [
    {
      id: "seed-don-1",
      amount: 25000,
      type: DonationType.PONCTUEL,
      affectation: DonationAffectation.BOURSES_EDUCATION,
      status: DonationStatus.SUCCESS,
      isAnonymous: false,
      donorFirstName: "Marie",
      donorLastName: "Dupont",
      donorEmail: "marie.dupont@example.com",
    },
    {
      id: "seed-don-2",
      amount: 50000,
      type: DonationType.PONCTUEL,
      affectation: DonationAffectation.GENERAL,
      status: DonationStatus.SUCCESS,
      isAnonymous: true,
    },
    {
      id: "seed-don-3",
      amount: 10000,
      type: DonationType.MENSUEL,
      affectation: DonationAffectation.SOUTIEN_FAMILLES,
      status: DonationStatus.PENDING,
      isAnonymous: false,
      donorFirstName: "Pierre",
      donorLastName: "Martin",
      donorEmail: "pierre.martin@example.com",
    },
  ]

  for (const don of donations) {
    await prisma.donation.upsert({
      where: { id: don.id },
      update: {},
      create: don,
    })
  }

  console.log(`✅ ${donations.length} dons créés`)

  // ── Paramètres ────────────────────────────────────────────
  console.log("\n🌱 Seeding paramètres...")

  const settings = [
    { key: "site_name", value: "Azaetogo" },
    { key: "contact_email", value: "contact@azaetogo.com" },
    { key: "contact_phone", value: "+228 90 00 00 00" },
    { key: "contact_address", value: "Lomé, Togo" },
    { key: "donation_min_amount", value: "1000" },
    { key: "cotisation_amount", value: "10000" },
    { key: "newsletter_enabled", value: "true" },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    })
  }

  console.log(`✅ ${settings.length} paramètres créés`)

  console.log("\n🎉 Seed terminé avec succès!")
  console.log("\n📋 Comptes de test:")
  console.log("   superadmin@azaetogo.com  →  /dashboard/admin  (SUPER_ADMIN)")
  console.log("   admin@azaetogo.com       →  /dashboard/admin  (ADMIN)")
  console.log("   editeur@azaetogo.com     →  /dashboard/admin  (EDITOR)")
  console.log("   membre@azaetogo.com      →  /dashboard/membre (MEMBER)")
  console.log("   membre2@azaetogo.com     →  /dashboard/membre (MEMBER)")
  console.log("   visiteur@azaetogo.com    →  /auth/login       (VISITOR — candidature pending)")
  console.log("   Mot de passe : Azae2025!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
