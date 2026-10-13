const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Transforming platform to VIT: Tech & Smart Gadgets...')

  // 1. UPDATE OR UPSERT ADMIN USER
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@murgdur.com'
  const passwordHash = await bcrypt.hash('Admin@123', 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: 'VIT',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'VIT',
      lastName: 'Admin',
      customerId: 'VIT-00000001',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log('✅ Admin user updated')

  // 2. UPDATE SITE CONFIGURATION FOR VIT TECH
  await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {
      siteTitle: 'VIT',
      siteMotto: 'NEXT-GEN TECH & GADGETS',
      colorGold: '#00f0ff',
      colorText: '#1a1a1a',
      colorBg: '#ffffff',
      colorMuted: '#64748b',
      footerTagline: 'Engineering the future. Next-generation gadgets, intelligent hardware & smart technology.',
      footerNote: '© 2026 VIT. All rights reserved.',
      invoiceCompanyName: 'VIT Tech Labs',
      invoiceFooterText: 'Thank you for choosing VIT Tech! Keep your order receipt for warranty coverage.',
      whatsappNumber: '918040001234',
      whatsappMessageTemplate: 'Hello VIT Support, I have an inquiry about a tech gadget.',
      homepageSections: [
        {
          id: 'new-arrivals',
          eyebrow: 'Latest Innovations',
          headline: 'Trending Tech & Gadgets',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'Cutting-edge gadgets just dropped into the VIT hardware ecosystem.'
        },
        {
          id: 'featured',
          eyebrow: 'Flagship Hardware',
          headline: 'Curated Pro Gear',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'Engineered for power users, creators, and tech enthusiasts.'
        },
        {
          id: 'editorial',
          eyebrow: 'VIT Engineering',
          headline: 'Precision Performance. Pure Innovation.',
          isActive: true,
          buttonUrl: '/collections/smart-devices',
          buttonLabel: 'Explore Devices',
          description: 'Every VIT device is crafted with aerospace-grade materials, custom microchips, and intelligent thermals. Built to redefine the way you live, work, and play.'
        },
        {
          id: 'philosophy',
          eyebrow: 'Our Vision',
          headline: 'Technology Built Without Compromise.',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'We believe hardware should be powerful, beautiful, and intuitive. From high-fidelity studio acoustics to ultra-portable computing, we build tomorrow.'
        },
        {
          id: 'newsletter',
          eyebrow: 'VIP Tech Access',
          headline: 'Stay Ahead of the Curve',
          isActive: true,
          buttonUrl: '',
          buttonLabel: 'Subscribe',
          description: 'Join the inner circle for exclusive beta drops, hardware launch events, and firmware announcements.'
        }
      ],
      productAccordions: [
        {
          title: 'Technical Specs & Performance',
          content: 'Built with next-gen silicon, high-efficiency GaN thermal architecture, aerospace-grade aluminum casing, and ultra-durable battery cells.'
        },
        {
          title: 'Warranty & Support',
          content: 'Includes 1-Year Comprehensive VIT Hardware Warranty with 24/7 priority customer support and hassle-free replacements.'
        },
        {
          title: 'Express Insured Shipping',
          content: 'Complimentary expedited delivery with end-to-end real-time GPS tracking and tamper-evident packaging.'
        }
      ]
    },
    create: {
      id: 'main',
      siteTitle: 'VIT',
      siteMotto: 'NEXT-GEN TECH & GADGETS',
      colorGold: '#00f0ff',
      colorText: '#1a1a1a',
      colorBg: '#ffffff',
      colorMuted: '#64748b',
      footerTagline: 'Engineering the future. Next-generation gadgets, intelligent hardware & smart technology.',
      footerNote: '© 2026 VIT. All rights reserved.',
      invoiceCompanyName: 'VIT Tech Labs',
      invoiceFooterText: 'Thank you for choosing VIT Tech! Keep your order receipt for warranty coverage.',
      whatsappNumber: '918040001234',
      whatsappMessageTemplate: 'Hello VIT Support, I have an inquiry about a tech gadget.',
    }
  })
  console.log('✅ Site configuration updated to VIT Tech')

  // 3. TECH CATEGORIES
  const techCategories = [
    { name: 'Smart Devices & Audio', slug: 'smart-devices', sortOrder: 1 },
    { name: 'Laptops & Computing',   slug: 'computing',     sortOrder: 2 },
    { name: 'Wearables & Watches',   slug: 'wearables',     sortOrder: 3 },
    { name: 'Gaming Gear & VR',      slug: 'gaming-gear',   sortOrder: 4 },
    { name: 'Drones & Cameras',      slug: 'drones-cameras',sortOrder: 5 },
    { name: 'GaN Chargers & Power',  slug: 'power-chargers',sortOrder: 6 },
  ]

  const categoryMap = {}
  for (const cat of techCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, isActive: true },
      create: cat,
    })
    categoryMap[cat.slug] = created.id
  }
  console.log('✅ Tech Categories initialized')

  // 4. HOMEPAGE HERO & SCROLL SLIDES (Tech & Gadgets)
  await prisma.homepageSlide.deleteMany()

  const techSlides = [
    {
      mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      placement: 'hero',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'VIT SONICPULSE ANC',
      subheading: 'STUDIO-GRADE SPATIAL ACOUSTICS',
      linkUrl: '/collections/smart-devices',
      sortOrder: 0,
      isActive: true,
    },
    {
      mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      placement: 'hero',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'VIT APEX TITAN WATCH',
      subheading: 'TITANIUM CHASSIS. SAPPHIRE GLASS.',
      linkUrl: '/collections/wearables',
      sortOrder: 1,
      isActive: true,
    },
    {
      mediaUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      placement: 'hero',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'VIT AEROGLIDE 4K PRO',
      subheading: 'TRI-AXIS GIMBAL DRONE WITH AI TRACKING',
      linkUrl: '/collections/drones-cameras',
      sortOrder: 2,
      isActive: true,
    },
    {
      mediaUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      placement: 'scroll',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'CYBERDECK MECHANICAL',
      subheading: 'HOT-SWAPPABLE TRI-MODE KEYBOARD',
      linkUrl: '/collections/gaming-gear',
      sortOrder: 0,
      isActive: true,
    },
    {
      mediaUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      placement: 'scroll',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'VIT VISION SPATIAL VR',
      subheading: 'DUAL 4K MICRO-OLED SPATIAL COMPUTING',
      linkUrl: '/collections/gaming-gear',
      sortOrder: 1,
      isActive: true,
    }
  ]

  for (const s of techSlides) {
    await prisma.homepageSlide.create({ data: s })
  }
  console.log('✅ Homepage Tech Slides created')

  // 5. FLAGSHIP TECH GADGETS
  const techProducts = [
    {
      name: 'VIT SonicPulse Studio ANC Wireless Headphones',
      slug: 'vit-sonicpulse-studio-anc',
      sku: 'VIT-AUD-001',
      description: 'Studio-grade wireless over-ear headphones featuring 45dB Active Noise Cancellation, custom 40mm beryllium drivers, spatial audio head-tracking, and 60-hour ultra-long battery life.',
      shortDesc: 'Studio-grade ANC headphones with spatial acoustics.',
      price: 24999.00,
      comparePrice: 29999.00,
      categoryId: categoryMap['smart-devices'],
      brand: 'VIT',
      material: 'Aircraft Aluminum & Memory Foam',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-AUD-001-BLK', color: 'Midnight Black', colorHex: '#111111', size: 'Standard', stock: 45 },
        { sku: 'VIT-AUD-001-SLV', color: 'Cyber Silver',   colorHex: '#cccccc', size: 'Standard', stock: 30 }
      ]
    },
    {
      name: 'VIT Apex Titan Smartwatch Ultra',
      slug: 'vit-apex-titan-smartwatch-ultra',
      sku: 'VIT-WCH-002',
      description: 'Built for extreme endurance. Aerospace Grade 5 Titanium case, sapphire crystal touchscreen, dual-frequency GPS, comprehensive ECG & SpO2 health sensors, and 14-day battery life.',
      shortDesc: 'Titanium aerospace smartwatch with sapphire display.',
      price: 34999.00,
      comparePrice: 39999.00,
      categoryId: categoryMap['wearables'],
      brand: 'VIT',
      material: 'Aerospace Grade 5 Titanium & Sapphire',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-WCH-002-TIT', color: 'Titanium Gray', colorHex: '#707070', size: '49mm', stock: 25 },
        { sku: 'VIT-WCH-002-BLK', color: 'DLC Stealth Black', colorHex: '#151515', size: '49mm', stock: 35 }
      ]
    },
    {
      name: 'VIT AeroGlide 4K GPS Foldable Drone',
      slug: 'vit-aeroglide-4k-gps-drone',
      sku: 'VIT-DRN-003',
      description: 'Ultra-portable aerial imaging drone equipped with a 3-axis mechanical gimbal, 1/1.3-inch 4K HDR CMOS sensor, 360-degree omnidirectional obstacle sensing, and 45-minute flight time.',
      shortDesc: '4K HDR Gimbal Drone with omnidirectional AI sensing.',
      price: 68999.00,
      comparePrice: 74999.00,
      categoryId: categoryMap['drones-cameras'],
      brand: 'VIT',
      material: 'Carbon Fiber & Polycarbonate',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-DRN-003-COM', color: 'Fly More Combo', colorHex: '#4a5568', size: 'Standard', stock: 18 }
      ]
    },
    {
      name: 'VIT CyberDeck 75% Wireless Mechanical Keyboard',
      slug: 'vit-cyberdeck-75-mechanical-keyboard',
      sku: 'VIT-KBD-004',
      description: 'Premium gasket-mounted custom mechanical keyboard with CNC aluminum chassis, pre-lubed tactile switches, south-facing RGB, built-in customizable smart OLED display screen, and tri-mode 2.4G/BT/Wired connection.',
      shortDesc: 'CNC Aluminum gasket mechanical keyboard with OLED display.',
      price: 15499.00,
      comparePrice: 18999.00,
      categoryId: categoryMap['gaming-gear'],
      brand: 'VIT',
      material: '6063 CNC Aluminum & PBT Keycaps',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-KBD-004-LIN', color: 'Cyber Cyan Linear', colorHex: '#00f0ff', size: '75%', stock: 40 },
        { sku: 'VIT-KBD-004-TAC', color: 'Stealth Tactile',   colorHex: '#222222', size: '75%', stock: 50 }
      ]
    },
    {
      name: 'VIT ProBook Max 16-inch M3 Computing Workstation',
      slug: 'vit-probook-max-16-workstation',
      sku: 'VIT-LAP-005',
      description: 'Extreme mobile computing workstation boasting a 16.2-inch Liquid Retina XDR 120Hz display, vapor chamber cooling, 32GB Unified RAM, 1TB NVMe Gen4 SSD, and whisper-quiet fans.',
      shortDesc: '16-inch Liquid Retina workstation for pro creators.',
      price: 189999.00,
      comparePrice: 199999.00,
      categoryId: categoryMap['computing'],
      brand: 'VIT',
      material: 'Recycled Aerospace Aluminum',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-LAP-005-SPG', color: 'Space Gray', colorHex: '#4b5563', size: '32GB / 1TB', stock: 12 },
        { sku: 'VIT-LAP-005-SIL', color: 'Silver',     colorHex: '#e5e7eb', size: '32GB / 1TB', stock: 15 }
      ]
    },
    {
      name: 'VIT Vision Spatial AR Glasses',
      slug: 'vit-vision-spatial-ar-glasses',
      sku: 'VIT-VR-006',
      description: 'Next-generation augmented reality glasses projecting a 201-inch virtual OLED screen. Features 120Hz refresh rate, 6DoF spatial tracking, and directional acoustic speakers in an ultra-lightweight 75g sunglasses form factor.',
      shortDesc: '201-inch Virtual OLED AR Glasses in 75g form factor.',
      price: 49999.00,
      comparePrice: 55999.00,
      categoryId: categoryMap['gaming-gear'],
      brand: 'VIT',
      material: 'Magnesium-Aluminum Alloy',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-VR-006-GLS', color: 'Onyx Black', colorHex: '#1a1a1a', size: 'Universal', stock: 20 }
      ]
    },
    {
      name: 'VIT QuantumGaN 140W Fast Power Station',
      slug: 'vit-quantumgan-140w-fast-charger',
      sku: 'VIT-PWR-007',
      description: 'Ultra-compact Gallium Nitride (GaN III) fast desktop charger with 3x USB-C PD 3.1 and 1x USB-A ports. Capable of charging laptops, phones, and accessories simultaneously at peak wattage.',
      shortDesc: '140W GaN III Fast Power Station with 4 Ports.',
      price: 6999.00,
      comparePrice: 8499.00,
      categoryId: categoryMap['power-chargers'],
      brand: 'VIT',
      material: 'Fireproof Polycarbonate & Copper Heat Spreader',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1609592807664-839f9797d100?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-PWR-007-BLK', color: 'Matte Graphite', colorHex: '#262626', size: '140W', stock: 65 }
      ]
    },
    {
      name: 'VIT TrueAir ANC Wireless Earbuds',
      slug: 'vit-trueair-anc-wireless-earbuds',
      sku: 'VIT-EAR-008',
      description: 'Ergonomic high-fidelity wireless earbuds with hybrid noise cancelling, LDAC lossless codec, transparency mode, wireless charging case, and IPX7 sweat & waterproof rating.',
      shortDesc: 'Lossless LDAC wireless earbuds with IPX7 rating.',
      price: 11999.00,
      comparePrice: 14999.00,
      categoryId: categoryMap['smart-devices'],
      brand: 'VIT',
      material: 'Ceramic composite & silicone',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-EAR-008-WHT', color: 'Glacier White', colorHex: '#f8fafc', size: 'Universal', stock: 80 },
        { sku: 'VIT-EAR-008-BLK', color: 'Midnight Black', colorHex: '#0f172a', size: 'Universal', stock: 60 }
      ]
    }
  ]

  for (const prod of techProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } })
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } })
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } })
      await prisma.product.delete({ where: { id: existing.id } })
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        shortDesc: prod.shortDesc,
        price: prod.price,
        comparePrice: prod.comparePrice,
        categoryId: prod.categoryId,
        brand: prod.brand,
        material: prod.material,
        isFeatured: prod.isFeatured,
        isActive: true,
      }
    })

    // Create Variants
    for (const v of prod.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          stock: v.stock,
          price: prod.price,
          isActive: true,
        }
      })
    }

    // Create Images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: prod.images[i],
          altText: `${prod.name} - View ${i + 1}`,
          sortOrder: i,
        }
      })
    }
  }

  console.log(`✅ ${techProducts.length} Flagship Tech Products & Gadgets Seeded!`)
  console.log('🎉 VIT Tech & Gadget Platform is Ready!')
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed VIT Tech:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
