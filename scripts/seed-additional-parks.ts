import { db } from "../server/db";
import { locations } from "../shared/schema";

const parkLocations = [
  {
    name: "Regent's Park",
    description: "A beautiful royal park with dedicated dog-friendly areas and scenic walking paths.",
    category: "park",
    address: "Chester Road, London NW1 4NR",
    latitude: 51.5273,
    longitude: -0.1582,
    rating: 4.8,
    reviewCount: 85,
    imageUrl: "https://images.unsplash.com/photo-1595867818082-083862f3aaf4?ixlib=rb-4.0.3",
    features: "Off-leash areas,Water fountains,Waste bins,Scenic walking paths",
    distanceMiles: 1.2
  },
  {
    name: "Hampstead Heath",
    description: "Vast natural space with woodland, swimming ponds, and excellent dog walking areas.",
    category: "park",
    address: "Parliament Hill, London NW3 2PT",
    latitude: 51.5608,
    longitude: -0.1426,
    rating: 4.9,
    reviewCount: 122,
    imageUrl: "https://images.unsplash.com/photo-1590653956132-7124e0b832e2?ixlib=rb-4.0.3",
    features: "Swimming areas for dogs,Hills for exercise,Natural woodland,Off-leash permitted",
    distanceMiles: 3.5
  },
  {
    name: "Victoria Park",
    description: "London's oldest public park with plenty of space for dogs to roam and play.",
    category: "park",
    address: "Grove Road, London E3 5TB",
    latitude: 51.5362,
    longitude: -0.0359,
    rating: 4.7,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1595851735431-71b0c187e8e5?ixlib=rb-4.0.3",
    features: "Wide open spaces,Dog-friendly cafes nearby,Dog waste facilities,Lakes and ponds",
    distanceMiles: 2.8
  },
  {
    name: "Greenwich Park",
    description: "Historic royal park offering panoramic views of London and spacious areas for dogs.",
    category: "park",
    address: "Greenwich, London SE10 8QY",
    latitude: 51.4769,
    longitude: 0.0005,
    rating: 4.8,
    reviewCount: 91,
    imageUrl: "https://images.unsplash.com/photo-1516911046066-bb7e8f9ac735?ixlib=rb-4.0.3",
    features: "Royal park setting,Hills for exercise,Open fields,Historical landmarks",
    distanceMiles: 5.2
  },
  {
    name: "Richmond Park",
    description: "London's largest royal park with ancient woodland and roaming deer. Dogs must be on leash in some areas.",
    category: "park",
    address: "Richmond, London TW10 5HS",
    latitude: 51.4422,
    longitude: -0.2639,
    rating: 4.9,
    reviewCount: 145,
    imageUrl: "https://images.unsplash.com/photo-1598814836108-193c9cafa1a1?ixlib=rb-4.0.3",
    features: "Wildlife spotting,Ancient trees,Open grassland,Designated dog swimming pond",
    distanceMiles: 8.3
  }
];

async function seedAdditionalParks() {
  try {
    console.log("Seeding additional dog-friendly parks near London...");
    
    for (const park of parkLocations) {
      // Check if park already exists to avoid duplicates
      const existingPark = await db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.name, park.name)
      });
      
      if (!existingPark) {
        await db.insert(locations).values(park);
        console.log(`Added park: ${park.name}`);
      } else {
        console.log(`Park ${park.name} already exists, skipping`);
      }
    }
    
    console.log("Additional parks seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding additional parks:", error);
  } finally {
    process.exit(0);
  }
}

seedAdditionalParks();