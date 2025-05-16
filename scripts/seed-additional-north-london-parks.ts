import { db } from "../server/db";
import { locations } from "../shared/schema";

const northLondonParks = [
  {
    name: "Caledonian Park",
    description: "Historic park with a prominent clock tower, offering grassy spaces and woodland areas ideal for dog walking.",
    category: "park",
    address: "Market Road, London N7 9PL",
    latitude: 51.5452,
    longitude: -0.1174,
    rating: 4.5,
    reviewCount: 68,
    imageUrl: "https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-4.0.3",
    features: "Historic clock tower,Off-leash areas,Woodland paths,Open fields",
    distanceMiles: 1.8
  },
  {
    name: "Whittington Park",
    description: "Neighborhood park with sports facilities and plenty of green space for dogs to enjoy.",
    category: "park",
    address: "Holloway Road, London N19 4RS",
    latitude: 51.5610,
    longitude: -0.1255,
    rating: 4.4,
    reviewCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1534251623194-8ab8b01aa4a1?ixlib=rb-4.0.3",
    features: "Sports facilities,Dog walking paths,Grassy areas,Community atmosphere",
    distanceMiles: 2.3
  },
  {
    name: "Highbury Fields",
    description: "Islington's largest park featuring tree-lined paths and open spaces, perfect for dog walking.",
    category: "park",
    address: "Highbury Pl, London N5 1QP",
    latitude: 51.5503,
    longitude: -0.1038,
    rating: 4.7,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3",
    features: "Tennis courts,Swimming pool nearby,Victorian houses view,Wide open spaces",
    distanceMiles: 1.9
  },
  {
    name: "Paradise Park",
    description: "Community park with play areas and gardens where dogs can enjoy the green spaces.",
    category: "park",
    address: "Mackenzie Rd, London N7 8RE",
    latitude: 51.5456,
    longitude: -0.1093,
    rating: 4.3,
    reviewCount: 47,
    imageUrl: "https://images.unsplash.com/photo-1574954126277-c16be325d1fb?ixlib=rb-4.0.3",
    features: "Children's play area,Community garden,Dog walking paths,Relaxing atmosphere",
    distanceMiles: 1.7
  }
];

async function seedNorthLondonParks() {
  try {
    console.log("Seeding additional North London parks...");
    
    for (const park of northLondonParks) {
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
    
    console.log("Additional North London parks seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding additional North London parks:", error);
  } finally {
    process.exit(0);
  }
}

seedNorthLondonParks();