import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFeed() {
  const existing = await prisma.post.findFirst({ where: { mediaType: 'IMAGE' } });
  if (existing) {
    console.log('Feed already seeded');
    return;
  }

  // Find first pet
  const pet = await prisma.pet.findFirst();
  if (!pet) {
    console.log('No pet found, skipping seed');
    return;
  }

  const posts = [
    {
      content: '今天天气真好，带布丁去公园散步了！',
      images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'],
    },
    {
      content: '新买的玩具，它超喜欢',
      images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600'],
    },
    {
      content: '午后的阳光真舒服，一起打个盹',
      images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'],
    },
    {
      content: '和小伙伴们在草地上疯跑，累坏了',
      images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'],
    },
  ];

  for (const p of posts) {
    await prisma.post.create({
      data: {
        authorPetId: pet.id,
        content: p.content,
        mediaType: 'IMAGE',
        status: 'ACTIVE',
        moderationStatus: 'APPROVED',
        images: { create: [{ url: p.images[0], order: 0 }] },
      },
    });
  }
  console.log('Seeded 4 posts with images');
}

seedFeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
