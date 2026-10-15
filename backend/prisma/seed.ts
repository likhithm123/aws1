import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initializing clean Murgdur database...')

  // ── 1. ADMIN USER (Clean slate admin login) ───────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@murgdur.com'
  const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123'
  const passwordHash = await bcrypt.hash(rawPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      customerId: 'MRG-00000001',
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  console.log(`✅ Admin user created:`)
  console.log(`   Email:    ${adminEmail}`)
  console.log(`   Password: ${rawPassword}`)
  console.log(`   Role:     ${admin.role}`)

  // ── 2. SITE CONFIG ────────────────────────────────────────────────────────
  await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {
      siteTitle: 'VIT Electronics',
      siteMotto: 'Your Trusted Tech Store',
      footerTagline: 'Quality electronics for every need.',
      footerNote: '© 2026 VIT Electronics. All rights reserved.',
      whatsappMessageTemplate: 'Hello VIT Electronics, I would like to inquire about an order.',
    },
    create: {
      id: 'main',
      siteTitle: 'VIT Electronics',
      siteMotto: 'Your Trusted Tech Store',
      colorGold: '#c9a96e',
      colorText: '#1a1a1a',
      colorBg: '#ffffff',
      colorMuted: '#6f6c64',
      footerTagline: 'Quality electronics for every need.',
      footerNote: '© 2026 VIT Electronics. All rights reserved.',
      whatsappNumber: '919876543210',
      whatsappMessageTemplate: 'Hello VIT Electronics, I would like to inquire about an order.',
    },
  })
  console.log('✅ Site configuration initialized')

  // ── 3. BASE CATEGORIES (Empty containers for admin product catalog) ────────
  const categories = [
    { name: 'Men', slug: 'men', sortOrder: 1 },
    { name: 'Women', slug: 'women', sortOrder: 2 },
    { name: 'Bags', slug: 'bags', sortOrder: 3 },
    { name: 'Watches', slug: 'watches', sortOrder: 4 },
    { name: 'Collections', slug: 'collections', sortOrder: 5 },
    { name: 'New Arrivals', slug: 'new-arrivals', sortOrder: 0 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Base category structure initialized (0 products — blank catalog)')

  console.log('')
  console.log('🎉 Clean database initialized successfully!')
  console.log('   All product and order tables are completely blank.')
  console.log('   Log into http://localhost:3000/login or /admin to manage your store.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })