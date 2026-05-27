import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { haversineDistance, fuzzyDistanceText } from '@/lib/distance';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const type = searchParams.get('type') || undefined;
  const size = searchParams.get('size') || undefined;
  const personalityTag = searchParams.get('personalityTag') || undefined;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: '缺少位置参数 lat, lng' }, { status: 400 });
  }

  // Get current user's pets
  const userPets = await prisma.pet.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  // Coarse filter: get all PetLocations (we'll filter by geoPrefix)
  const allLocations = await prisma.petLocation.findMany({
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          type: true,
          breed: true,
          avatar: true,
          personalityTags: true,
          size: true,
          gender: true,
          bio: true,
        },
      },
    },
  });

  // Filter: exclude user's own pets, apply type/size/personalityTag filters
  // Get user's city for coarse filtering
  const userLocation = await prisma.petLocation.findFirst({
    where: { petId: { in: userPetIds } },
  });
  const userCity = userLocation?.city || '';

  const candidates = allLocations.filter((loc) => {
    // Exclude own pets
    if (userPetIds.includes(loc.petId)) return false;

    // Coarse city-level filter
    if (userCity && loc.city !== userCity) return false;

    // Type filter
    if (type && loc.pet.type !== type) return false;

    // Size filter
    if (size && loc.pet.size !== size) return false;

    // Personality tag filter
    if (personalityTag) {
      const tags: string[] = JSON.parse(loc.pet.personalityTags || '[]');
      if (!tags.includes(personalityTag)) return false;
    }

    return true;
  });

  // Compute distances
  const withDistances = candidates.map((loc) => ({
    ...loc,
    distance: haversineDistance(lat, lng, loc.lat, loc.lng),
  }));

  withDistances.sort((a, b) => a.distance - b.distance);

  // Take max 20
  const results = withDistances.slice(0, 20).map((loc) => {
    const tags: string[] = JSON.parse(loc.pet.personalityTags || '[]');
    return {
      id: loc.pet.id,
      name: loc.pet.name,
      type: loc.pet.type,
      breed: loc.pet.breed,
      avatar: loc.pet.avatar,
      personalityTags: tags,
      size: loc.pet.size,
      gender: loc.pet.gender,
      bio: loc.pet.bio,
      city: loc.city,
      district: loc.district,
      fuzzyDistance: fuzzyDistanceText(loc.distance, loc.district || undefined),
    };
  });

  return NextResponse.json({ pets: results });
}
