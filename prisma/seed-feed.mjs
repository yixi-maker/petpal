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
      images: ['/feed/park-run.jpg'],
    },
    {
      content: '新买的玩具，它超喜欢',
      images: ['/feed/toy-time.jpg'],
    },
    {
      content: '午后的阳光真舒服，一起打个盹',
      images: ['/feed/sunny-cat.jpg'],
    },
    {
      content: '和小伙伴们在草地上疯跑，累坏了',
      images: ['/feed/grass-friends.jpg'],
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
