import { db } from '../server/db';
import { locations } from '../shared/schema';

async function seedLondonLocations() {
  console.log('Seeding London dog-friendly locations...');
  
  const londonLocations = [
    {
      name: "Hyde Park",
      description: "Expansive park with designated dog areas and plenty of space for dogs to run free",
      category: "park",
      address: "Hyde Park, London, UK",
      latitude: 51.507268,
      longitude: -0.165730,
      rating: 4.8,
      reviewCount: 320,
      imageUrl: "https://images.unsplash.com/photo-1585155967849-91c736589c84?q=80&w=2574",
      features: "Off-leash areas,Water fountains,Space to run,Shaded areas",
      distanceMiles: 0.5
    },
    {
      name: "The Spaniards Inn",
      description: "Historic pub with dog-friendly areas and treats for furry visitors",
      category: "restaurant",
      address: "Spaniards Road, Hampstead, London NW3 7JJ",
      latitude: 51.569903,
      longitude: -0.174847,
      rating: 4.6,
      reviewCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1590576210275-6ef00ea22080?q=80&w=2574",
      features: "Dog treats,Water bowls,Outdoor seating,Dog-friendly indoor area",
      distanceMiles: 1.2
    },
    {
      name: "Hampstead Heath",
      description: "Large ancient heath with swimming ponds and wonderful views of London",
      category: "park",
      address: "Hampstead, London NW3 1BP",
      latitude: 51.562111,
      longitude: -0.163902,
      rating: 4.9,
      reviewCount: 412,
      imageUrl: "https://images.unsplash.com/photo-1601041085857-71e3a35ddd79?q=80&w=2670",
      features: "Off-leash walking,Swimming ponds for dogs,Large open spaces,Woodland trails",
      distanceMiles: 1.4
    },
    {
      name: "Shake Shack (Covent Garden)",
      description: "Fast-casual restaurant that offers dog-friendly outdoor seating and special dog treats",
      category: "cafe",
      address: "24 Market Building, The Piazza, Covent Garden, London WC2E 8RD",
      latitude: 51.512246,
      longitude: -0.123636,
      rating: 4.3,
      reviewCount: 187,
      imageUrl: "https://images.unsplash.com/photo-1628660304411-e20db9c191f8?q=80&w=2574",
      features: "Dog biscuits,Water bowls,Outdoor seating",
      distanceMiles: 0.8
    },
    {
      name: "Paws for Coffee",
      description: "Dog cafe specifically designed for dogs and their owners with a special menu for pups",
      category: "cafe",
      address: "17 Station Rd, Hampton, London TW12 2BX",
      latitude: 51.421073,
      longitude: -0.367358,
      rating: 4.7,
      reviewCount: 143,
      imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2574",
      features: "Dog menu,Dog beds,Treats,Indoor seating,Outdoor area",
      distanceMiles: 2.3
    },
    {
      name: "Richmond Park",
      description: "Largest Royal Park in London with 2,500 acres of dog-friendly space",
      category: "park",
      address: "Richmond, London TW10 5HS",
      latitude: 51.447017,
      longitude: -0.294115,
      rating: 4.9,
      reviewCount: 465,
      imageUrl: "https://images.unsplash.com/photo-1574783760642-8858283bec6d?q=80&w=2574",
      features: "Vast open spaces,Woodland trails,Dog ponds,Wildlife viewing",
      distanceMiles: 3.1
    },
    {
      name: "Dog and Fox",
      description: "Stylish pub with a dog-friendly policy and outdoor terrace",
      category: "restaurant",
      address: "24 High St, Wimbledon, London SW19 5DX",
      latitude: 51.421725,
      longitude: -0.217695,
      rating: 4.4,
      reviewCount: 221,
      imageUrl: "https://images.unsplash.com/photo-1523145149804-5d8e0c044753?q=80&w=2574",
      features: "Dog treats at bar,Water bowls,Dog-friendly rooms,Garden area",
      distanceMiles: 2.6
    },
    {
      name: "Primrose Hill",
      description: "Popular hill with panoramic views of London and dog-friendly surroundings",
      category: "park",
      address: "Primrose Hill, London NW1 4NR",
      latitude: 51.538612,
      longitude: -0.159612,
      rating: 4.7,
      reviewCount: 298,
      imageUrl: "https://images.unsplash.com/photo-1558546520-994b8f4538c2?q=80&w=2574",
      features: "Off-leash areas,Great views,Nearby dog-friendly cafes",
      distanceMiles: 1.1
    },
    {
      name: "Love My Human Townhouse",
      description: "Upscale pet boutique with a dog-friendly cafe",
      category: "store",
      address: "308 King's Rd, Chelsea, London SW3 5UH",
      latitude: 51.484691,
      longitude: -0.175216,
      rating: 4.5,
      reviewCount: 112,
      imageUrl: "https://images.unsplash.com/photo-1611173622933-91942e194f86?q=80&w=2670",
      features: "Pet boutique,Dog cafe,Grooming services,Dog treats",
      distanceMiles: 1.8
    },
    {
      name: "Kensington Gardens",
      description: "Royal park with spacious lawns and dedicated dog walking areas",
      category: "park",
      address: "Kensington Gardens, London W2 2UH",
      latitude: 51.506321,
      longitude: -0.175097,
      rating: 4.7,
      reviewCount: 356,
      imageUrl: "https://images.unsplash.com/photo-1557990708-4002ec9e32f5?q=80&w=2574",
      features: "Italian Gardens,Dog walking paths,Water access,Large open spaces",
      distanceMiles: 0.7
    }
  ];

  // Insert locations into the database
  try {
    // Insert the locations
    await db.insert(locations).values(londonLocations);
    console.log(`Successfully added ${londonLocations.length} London dog-friendly locations`);
  } catch (error) {
    console.error('Error seeding London locations:', error);
  }
}

// Run the seeding function
seedLondonLocations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });