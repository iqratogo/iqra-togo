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
  const hashedPassword = await bcrypt.hash("Iqra2025!", 12)

  // ── Utilisateurs ──────────────────────────────────────────
  console.log("🌱 Seeding utilisateurs...")

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@iqratogo.org" },
    update: {},
    create: {
      name: "Super Admin IQRA",
      email: "superadmin@iqratogo.org",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@iqratogo.org" },
    update: {},
    create: {
      name: "Admin IQRA",
      email: "admin@iqratogo.org",
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: "editeur@iqratogo.org" },
    update: {},
    create: {
      name: "Éditeur IQRA",
      email: "editeur@iqratogo.org",
      password: hashedPassword,
      role: UserRole.EDITOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const membreUser = await prisma.user.upsert({
    where: { email: "membre@iqratogo.org" },
    update: {},
    create: {
      name: "Kofi Mensah",
      email: "membre@iqratogo.org",
      password: hashedPassword,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const membre2User = await prisma.user.upsert({
    where: { email: "membre2@iqratogo.org" },
    update: {},
    create: {
      name: "Ama Koffi",
      email: "membre2@iqratogo.org",
      password: hashedPassword,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  const visiteurUser = await prisma.user.upsert({
    where: { email: "visiteur@iqratogo.org" },
    update: {},
    create: {
      name: "Jean Visiteur",
      email: "visiteur@iqratogo.org",
      password: hashedPassword,
      role: UserRole.VISITOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  console.log("✅ Utilisateurs créés:")
  console.log("   SUPER_ADMIN : superadmin@iqratogo.org")
  console.log("   ADMIN       : admin@iqratogo.org")
  console.log("   EDITOR      : editeur@iqratogo.org")
  console.log("   MEMBER      : membre@iqratogo.org")
  console.log("   MEMBER      : membre2@iqratogo.org")
  console.log("   VISITOR     : visiteur@iqratogo.org")
  console.log("   Mot de passe commun : Iqra2025!")

  // ── Profils membres ───────────────────────────────────────
  console.log("\n🌱 Seeding profils membres...")

  const membre1 = await prisma.member.upsert({
    where: { userId: membreUser.id },
    update: {},
    create: {
      userId: membreUser.id,
      memberNumber: "IQRA-0001",
      civility: "M",
      firstName: "Kofi",
      lastName: "Mensah",
      phone: "+22890000001",
      country: "Togo",
      city: "Tchamba",
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
      memberNumber: "IQRA-0002",
      civility: "MME",
      firstName: "Ama",
      lastName: "Koffi",
      phone: "+22890000002",
      country: "Togo",
      city: "Tchamba",
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

  console.log("✅ Profils membres créés : IQRA-0001 (Kofi Mensah), IQRA-0002 (Ama Koffi)")

  // ── Candidature en attente ─────────────────────────────────
  console.log("\n🌱 Seeding candidature...")

  /* Suppression préalable pour éviter les conflits sur dossierNumber (unique) */
  await prisma.membershipApplication.deleteMany({
    where: { OR: [{ dossierNumber: "DOSSIER-0001" }, { userId: visiteurUser.id }] },
  })
  await prisma.membershipApplication.create({
    data: {
      userId: visiteurUser.id,
      dossierNumber: "DOSSIER-0001",
      civility: "M",
      firstName: "Jean",
      lastName: "Visiteur",
      email: "visiteur@iqratogo.org",
      phone: "+22890000003",
      country: "Togo",
      city: "Tchamba",
      profession: "Étudiant",
      motivation: "Je souhaite rejoindre IQRA TOGO pour contribuer à l'orientation scolaire et au soutien des orphelins au Togo.",
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
      title: "Journée d'orientation scolaire à Lomé",
      slug: "journee-orientation-scolaire-lome",
      excerpt: "IQRA TOGO a organisé une grande journée d'orientation pour 150 lycéens de Lomé, avec des conseillers spécialisés et des témoignages d'anciens bénéficiaires.",
      content: "<p>IQRA TOGO est fière d'annoncer le succès de sa journée d'orientation scolaire à Lomé. Cet événement, financé grâce aux dons de nos généreux donateurs, a permis à plus de 150 lycéens de découvrir les filières qui correspondent à leurs aptitudes et aspirations.</p><p>Des conseillers d'orientation, des universitaires et des professionnels ont animé des ateliers pratiques tout au long de la journée. La devise de notre association — <em>Le savoir, la liberté</em> — n'a jamais été aussi vivante.</p>",
      category: PostCategory.PROJET,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-03-01"),
      authorId: superAdmin.id,
      seoTitle: "Journée orientation scolaire Lomé — IQRA TOGO",
      seoDescription: "IQRA TOGO organise une journée d'orientation pour 150 lycéens à Lomé. Découvrez ce projet éducatif au Togo.",
    },
    {
      id: "seed-post-2",
      title: "Distribution de kits scolaires aux orphelins",
      slug: "distribution-kits-scolaires-orphelins-2025",
      excerpt: "200 enfants orphelins ont reçu leurs kits scolaires complets pour la rentrée 2025, grâce à la générosité de nos donateurs.",
      content: "<p>Pour la rentrée scolaire 2025, IQRA TOGO a organisé une distribution de kits scolaires au profit de 200 enfants orphelins et vulnérables issus de différentes régions du Togo.</p><p>Cahiers, stylos, sacs, uniformes… tout a été prévu pour que ces enfants puissent aborder l'année scolaire dans les meilleures conditions. Parce que le savoir est la clé de leur liberté, aucun enfant ne doit être privé d'éducation par manque de moyens.</p>",
      category: PostCategory.ACTUALITE,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-02-15"),
      authorId: admin.id,
      seoTitle: "Kits scolaires orphelins 2025 — IQRA TOGO",
      seoDescription: "200 orphelins ont reçu leurs kits scolaires grâce à IQRA TOGO. Une action concrète pour l'éducation au Togo.",
    },
    {
      id: "seed-post-3",
      title: "Partenariat avec la Commune de Lomé",
      slug: "partenariat-commune-lome",
      excerpt: "IQRA TOGO signe un accord de partenariat avec la Commune de Lomé pour développer des programmes d'orientation et de soutien scolaire.",
      content: "<p>Un accord de partenariat stratégique a été signé entre IQRA TOGO et la Commune de Lomé. Cet accord permettra de mettre en place des programmes conjoints d'orientation scolaire et de soutien aux enfants orphelins de la capitale togolaise.</p>",
      category: PostCategory.PARTENAIRE,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2025-01-20"),
      authorId: superAdmin.id,
    },
    {
      id: "seed-post-4",
      title: "Formation en compétences numériques — Q2 2025",
      slug: "formation-competences-numeriques-2025",
      excerpt: "Brouillon — programme de renforcement de capacités numériques prévu pour Q2 2025.",
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
      firstName: "Radiatou",
      lastName: "OUKPEDJO",
      position: "Présidente",
      department: Department.DIRECTION,
      bio: "Présidente fondatrice d'IQRA TOGO, Mme OUKPEDJO Radiatou œuvre pour que chaque enfant togolais ait accès au savoir et à la liberté qu'il procure. Portée par la devise « Le savoir, la liberté », elle dirige l'association depuis ses débuts à Tchamba.",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "seed-team-2",
      firstName: "Fatou",
      lastName: "Traoré",
      position: "Directrice des Programmes",
      department: Department.PROGRAMMES,
      bio: "Responsable de la coordination des programmes d'orientation scolaire, de soutien aux orphelins et de renforcement de capacités. Elle supervise l'ensemble des interventions de terrain.",
      displayOrder: 2,
      isActive: true,
    },
    {
      id: "seed-team-3",
      firstName: "Kwame",
      lastName: "Asante",
      position: "Responsable Communication",
      department: Department.COMMUNICATION,
      bio: "Chargé de la visibilité d'IQRA TOGO et de la relation avec les donateurs, membres et partenaires. Il porte la voix de l'association sur tous les canaux.",
      displayOrder: 3,
      isActive: true,
    },
    {
      id: "seed-team-4",
      firstName: "Esi",
      lastName: "Boateng",
      position: "Responsable Financier",
      department: Department.FINANCE,
      bio: "Garante de la transparence financière et du suivi rigoureux des dons et cotisations, pour que chaque franc contribue directement aux bénéficiaires.",
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
    { key: "site_name", value: "IQRA TOGO" },
    { key: "contact_email", value: "contact@iqra-togo.com" },
    { key: "contact_phone", value: "+228 90 00 00 00" },
    { key: "contact_address", value: "Quartier Limamwa, Tchamba, Togo" },
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
  console.log("   superadmin@iqratogo.org  →  /dashboard/admin  (SUPER_ADMIN)")
  console.log("   admin@iqratogo.org       →  /dashboard/admin  (ADMIN)")
  console.log("   editeur@iqratogo.org     →  /dashboard/admin  (EDITOR)")
  console.log("   membre@iqratogo.org      →  /dashboard/membre (MEMBER)")
  console.log("   membre2@iqratogo.org     →  /dashboard/membre (MEMBER)")
  console.log("   visiteur@iqratogo.org    →  /auth/login       (VISITOR — candidature pending)")
  console.log("   Mot de passe : Iqra2025!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
