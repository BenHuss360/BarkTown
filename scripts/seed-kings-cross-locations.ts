import { db } from "../server/db";
import { locations } from "../shared/schema";

const kingsXLocations = [
  // Parks near Kings Cross
  {
    name: "Camley Street Natural Park",
    description: "Scenic urban nature reserve with woodland walks and pond areas where dogs are welcome on leash.",
    category: "park",
    address: "12 Camley St, London N1C 4PW",
    latitude: 51.5367,
    longitude: -0.1262,
    rating: 4.6,
    reviewCount: 64,
    imageUrl: "https://images.unsplash.com/photo-1547036512-4fdec8c4e4b0?ixlib=rb-4.0.3",
    features: "Wildlife habitat,Woodland paths,Pond viewing,On-leash dog walking",
    distanceMiles: 0.5
  },
  {
    name: "Granary Square",
    description: "Open square with water features and outdoor seating where dogs are welcome to enjoy the atmosphere.",
    category: "park",
    address: "Granary Square, London N1C 4AA",
    latitude: 51.5355,
    longitude: -0.1256,
    rating: 4.5,
    reviewCount: 58,
    imageUrl: "https://images.unsplash.com/photo-1607427225127-532ea73ea1a9?ixlib=rb-4.0.3",
    features: "Water features,Open space,Pet-friendly seating,Close to cafes",
    distanceMiles: 0.3
  },
  {
    name: "Lewis Cubitt Park",
    description: "Peaceful green space next to the canal with lawn areas perfect for dog walking.",
    category: "park",
    address: "Lewis Cubitt Park, London N1C",
    latitude: 51.5374,
    longitude: -0.1272,
    rating: 4.4,
    reviewCount: 42,
    imageUrl: "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?ixlib=rb-4.0.3",
    features: "Grassy areas,Canal views,Dog walking paths,Quiet atmosphere",
    distanceMiles: 0.4
  },
  {
    name: "St Pancras Gardens",
    description: "Historic garden with interesting monuments and peaceful paths for dog walking.",
    category: "park",
    address: "Pancras Rd, London NW1 1UL",
    latitude: 51.5328,
    longitude: -0.1275,
    rating: 4.3,
    reviewCount: 36,
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3",
    features: "Historic site,Shaded paths,Quiet space,Memorial garden",
    distanceMiles: 0.6
  },
  {
    name: "Regent's Canal Towpath",
    description: "Scenic waterside walking path perfect for dog walks with interesting sights along the way.",
    category: "park",
    address: "Regent's Canal, Kings Cross, London",
    latitude: 51.5357,
    longitude: -0.1235,
    rating: 4.7,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1565953522043-e0778df4c7c1?ixlib=rb-4.0.3",
    features: "Waterside walk,Long trail,Boats to watch,Multiple access points",
    distanceMiles: 0.4
  },
  {
    name: "Gasholder Park",
    description: "Unique circular park inside a restored Victorian gasholder frame, welcoming to dogs.",
    category: "park",
    address: "Gasholder Park, Kings Cross, London",
    latitude: 51.5369,
    longitude: -0.1247,
    rating: 4.4,
    reviewCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1562979314-bee7453e911c?ixlib=rb-4.0.3",
    features: "Unique architecture,Grassy lawn,Circular path,Canal views",
    distanceMiles: 0.4
  },
  {
    name: "Coal Drops Yard Gardens",
    description: "Landscaped gardens around the shopping district with pet-friendly areas.",
    category: "park",
    address: "Coal Drops Yard, Kings Cross, London",
    latitude: 51.5361,
    longitude: -0.1253,
    rating: 4.5,
    reviewCount: 47,
    imageUrl: "https://images.unsplash.com/photo-1596306499317-8490219592e9?ixlib=rb-4.0.3",
    features: "Modern landscaping,Urban green space,Small lawns,Near shopping",
    distanceMiles: 0.3
  },
  {
    name: "Calthorpe Community Garden",
    description: "Community garden with paths and green spaces where well-behaved dogs are welcome.",
    category: "park",
    address: "258-274 Gray's Inn Rd, London WC1X 8LH",
    latitude: 51.5283,
    longitude: -0.1184,
    rating: 4.3,
    reviewCount: 31,
    imageUrl: "https://images.unsplash.com/photo-1506917847218-b0ed96a0b24d?ixlib=rb-4.0.3",
    features: "Community atmosphere,Garden plots,Peaceful retreat,Urban oasis",
    distanceMiles: 0.9
  },
  {
    name: "Handyside Gardens",
    description: "Modern pocket park with landscaped areas and seating, dog-friendly throughout.",
    category: "park",
    address: "Handyside St, London N1C",
    latitude: 51.5379,
    longitude: -0.1257,
    rating: 4.2,
    reviewCount: 28,
    imageUrl: "https://images.unsplash.com/photo-1621955964441-c173e01c135b?ixlib=rb-4.0.3",
    features: "Modern design,Water features,Small but pleasant,Family friendly",
    distanceMiles: 0.5
  },
  {
    name: "Battlebridge Basin",
    description: "Scenic canal basin with interesting boats and walking areas for dogs on leash.",
    category: "park",
    address: "Kings Cross, London N1C",
    latitude: 51.5364,
    longitude: -0.1223,
    rating: 4.3,
    reviewCount: 39,
    imageUrl: "https://images.unsplash.com/photo-1580661593522-4273440c7b77?ixlib=rb-4.0.3",
    features: "Canal views,Boat watching,Peaceful walking,Historic area",
    distanceMiles: 0.5
  },
  
  // Shops near Kings Cross
  {
    name: "Fetch & Follow",
    description: "Stylish dog accessories and apparel shop with high-quality, design-led products.",
    category: "shop",
    address: "Unit 11, Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5358,
    longitude: -0.1260,
    rating: 4.8,
    reviewCount: 46,
    imageUrl: "https://images.unsplash.com/photo-1579693409324-f91710c341f6?ixlib=rb-4.0.3",
    features: "Luxury dog accessories,Handmade items,Friendly staff,Dog treats available",
    distanceMiles: 0.3
  },
  {
    name: "Lords at Home",
    description: "Homeware store that welcomes dogs and offers a selection of pet accessories.",
    category: "shop",
    address: "Kings Cross Station, N1C 4AH",
    latitude: 51.5320,
    longitude: -0.1240,
    rating: 4.5,
    reviewCount: 38,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3",
    features: "Pet homeware section,Dog-friendly staff,Water bowls provided,Free treats",
    distanceMiles: 0.4
  },
  {
    name: "Anthropologie",
    description: "Lifestyle store that welcomes well-behaved dogs while you browse their unique collections.",
    category: "shop",
    address: "Coal Drops Yard, Stable St, London N1C 4AB",
    latitude: 51.5356,
    longitude: -0.1256,
    rating: 4.4,
    reviewCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?ixlib=rb-4.0.3",
    features: "Dog-friendly policy,Spacious aisles,Friendly staff,Water bowls",
    distanceMiles: 0.3
  },
  {
    name: "Wolf & Badger",
    description: "Independent boutique with unique designer items where dogs are welcome to shop with you.",
    category: "shop",
    address: "Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5359,
    longitude: -0.1258,
    rating: 4.6,
    reviewCount: 57,
    imageUrl: "https://images.unsplash.com/photo-1539102463573-e0fad64e9dd8?ixlib=rb-4.0.3",
    features: "Independent designers,Dog accessories,Friendly environment,Treats for visiting dogs",
    distanceMiles: 0.3
  },
  {
    name: "Albion Cycles",
    description: "Bike shop with dog-friendly policy for browsing and consulting on purchases.",
    category: "shop",
    address: "4 Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5357,
    longitude: -0.1253,
    rating: 4.3,
    reviewCount: 31,
    imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?ixlib=rb-4.0.3",
    features: "Dogs welcome,Space to move,Water provided,Cycling accessories",
    distanceMiles: 0.3
  },
  {
    name: "The Canopy Market",
    description: "Weekly market under a Victorian canopy that welcomes dogs while you browse food and craft stalls.",
    category: "shop",
    address: "West Handyside Canopy, Kings Cross, London N1C",
    latitude: 51.5375,
    longitude: -0.1255,
    rating: 4.7,
    reviewCount: 83,
    imageUrl: "https://images.unsplash.com/photo-1527167598984-8fe9fe7c2ddf?ixlib=rb-4.0.3",
    features: "Food stalls,Craft vendors,Covered space,Dog treats for sale",
    distanceMiles: 0.4
  },
  {
    name: "Boutique by Shelter",
    description: "Charity shop with quality second-hand items where dogs are welcome while you browse.",
    category: "shop",
    address: "Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5356,
    longitude: -0.1259,
    rating: 4.5,
    reviewCount: 42,
    imageUrl: "https://images.unsplash.com/photo-1613843540162-2492d33e3aee?ixlib=rb-4.0.3",
    features: "Charity shop,Quality items,Dog-friendly policy,Friendly staff",
    distanceMiles: 0.3
  },
  {
    name: "Paper & Script",
    description: "Stationery and gift shop that welcomes dogs while you browse their unique paper goods.",
    category: "shop",
    address: "Coal Drops Yard, London N1C 4DH",
    latitude: 51.5357,
    longitude: -0.1255,
    rating: 4.4,
    reviewCount: 37,
    imageUrl: "https://images.unsplash.com/photo-1627225793904-fa80ca2d6b7d?ixlib=rb-4.0.3",
    features: "Handmade cards,Gift items,Dog-friendly atmosphere,Small shop",
    distanceMiles: 0.3
  },
  {
    name: "Waitrose Kings Cross",
    description: "Supermarket that allows dogs on leads to accompany you while shopping for groceries.",
    category: "shop",
    address: "Ground Floor, Midland Goods Shed, 1 Wharf Rd, London N1C 4BZ",
    latitude: 51.5372,
    longitude: -0.1251,
    rating: 4.3,
    reviewCount: 126,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3",
    features: "Grocery shopping,Pet food section,Wide aisles,Quick shopping",
    distanceMiles: 0.4
  },
  {
    name: "Space NK",
    description: "Beauty boutique that welcomes well-behaved dogs while you test and purchase products.",
    category: "shop",
    address: "Coal Drops Yard, London N1C 4AB",
    latitude: 51.5359,
    longitude: -0.1257,
    rating: 4.4,
    reviewCount: 38,
    imageUrl: "https://images.unsplash.com/photo-1470259078422-826894b933aa?ixlib=rb-4.0.3",
    features: "Beauty products,Friendly staff,Dog-friendly policy,High-end shopping",
    distanceMiles: 0.3
  },
  
  // Restaurants near Kings Cross
  {
    name: "Caravan Kings Cross",
    description: "Industrial-chic restaurant with a dog-friendly terrace serving global small plates and great coffee.",
    category: "restaurant",
    address: "1 Granary Square, London N1C 4AA",
    latitude: 51.5354,
    longitude: -0.1254,
    rating: 4.7,
    reviewCount: 108,
    imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3",
    features: "Outdoor seating,Water bowls,Brunch favorite,Coffee specialists",
    distanceMiles: 0.3
  },
  {
    name: "Drake & Morgan",
    description: "Stylish bar and restaurant with dog-friendly policy in their outdoor and bar areas.",
    category: "restaurant",
    address: "6 Pancras Square, London N1C 4AG",
    latitude: 51.5334,
    longitude: -0.1254,
    rating: 4.5,
    reviewCount: 87,
    imageUrl: "https://images.unsplash.com/photo-1554679665-f5537f187268?ixlib=rb-4.0.3",
    features: "Cocktail menu,Outdoor terrace,Dog treats,All-day dining",
    distanceMiles: 0.4
  },
  {
    name: "The Lighterman",
    description: "Contemporary pub with terrace seating overlooking Regent's Canal, welcoming to dogs outdoors.",
    category: "restaurant",
    address: "3 Granary Square, London N1C 4BH",
    latitude: 51.5356,
    longitude: -0.1254,
    rating: 4.6,
    reviewCount: 96,
    imageUrl: "https://images.unsplash.com/photo-1567498952578-e324968b82c9?ixlib=rb-4.0.3",
    features: "Canal views,Three floors,Excellent menu,Friendly service",
    distanceMiles: 0.3
  },
  {
    name: "German Gymnasium",
    description: "Grand European restaurant in a historic building with dog-friendly terrace seating.",
    category: "restaurant",
    address: "1 King's Blvd, London N1C 4BU",
    latitude: 51.5329,
    longitude: -0.1244,
    rating: 4.5,
    reviewCount: 92,
    imageUrl: "https://images.unsplash.com/photo-1606654810639-51ed6ef8e1ba?ixlib=rb-4.0.3",
    features: "Historic building,Central European cuisine,Dog-friendly terrace,All-day dining",
    distanceMiles: 0.3
  },
  {
    name: "Dishoom Kings Cross",
    description: "Popular Bombay-style café with a dedicated dog-friendly area on their veranda.",
    category: "restaurant",
    address: "5 Stable St, London N1C 4AB",
    latitude: 51.5353,
    longitude: -0.1260,
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?ixlib=rb-4.0.3",
    features: "Indian cuisine,Veranda seating,Water bowls,Breakfast to dinner",
    distanceMiles: 0.3
  },
  {
    name: "Vinoteca Kings Cross",
    description: "Wine bar and restaurant with Mediterranean food and a dog-friendly policy.",
    category: "restaurant",
    address: "3 King's Blvd, London N1C 4BU",
    latitude: 51.5338,
    longitude: -0.1244,
    rating: 4.6,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3",
    features: "Wine selection,Mediterranean food,Outdoor seating,Dog-friendly staff",
    distanceMiles: 0.3
  },
  {
    name: "Notes Coffee Roasters",
    description: "Specialty coffee shop and wine bar with a relaxed atmosphere where dogs are welcome.",
    category: "restaurant",
    address: "One Pancras Square, London N1C 4AG",
    latitude: 51.5332,
    longitude: -0.1251,
    rating: 4.5,
    reviewCount: 68,
    imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3",
    features: "Coffee specialists,Light meals,Dog-friendly indoor area,Relaxed atmosphere",
    distanceMiles: 0.4
  },
  {
    name: "Vermuteria",
    description: "Café and bar inspired by European cycling culture with dog-friendly terrace seating.",
    category: "restaurant",
    address: "38-39 Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5357,
    longitude: -0.1261,
    rating: 4.5,
    reviewCount: 62,
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3",
    features: "Vermouth focus,European snacks,Cycling memorabilia,Outside tables",
    distanceMiles: 0.3
  },
  {
    name: "Granary Square Brasserie",
    description: "All-day dining restaurant with a terrace overlooking Regent's Canal that welcomes dogs.",
    category: "restaurant",
    address: "Granary Square, 1-3 Stable St, London N1C 4AB",
    latitude: 51.5353,
    longitude: -0.1257,
    rating: 4.6,
    reviewCount: 84,
    imageUrl: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?ixlib=rb-4.0.3",
    features: "All-day dining,Terrace seating,Modern European cuisine,Weekend brunch",
    distanceMiles: 0.3
  },
  {
    name: "Morty & Bob's",
    description: "Casual café known for grilled cheese sandwiches with a dog-friendly policy.",
    category: "restaurant",
    address: "Coal Drops Yard, London N1C 4DQ",
    latitude: 51.5358,
    longitude: -0.1259,
    rating: 4.5,
    reviewCount: 73,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3",
    features: "Grilled cheese,Casual dining,Coffee menu,Pet-friendly staff",
    distanceMiles: 0.3
  }
];

async function seedKingsCrossLocations() {
  try {
    console.log("Seeding Kings Cross locations...");
    
    for (const location of kingsXLocations) {
      // Check if location already exists to avoid duplicates
      const existingLocation = await db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.name, location.name)
      });
      
      if (!existingLocation) {
        await db.insert(locations).values(location);
        console.log(`Added location: ${location.name}`);
      } else {
        console.log(`Location ${location.name} already exists, skipping`);
      }
    }
    
    console.log("Kings Cross locations seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding Kings Cross locations:", error);
  } finally {
    process.exit(0);
  }
}

seedKingsCrossLocations();