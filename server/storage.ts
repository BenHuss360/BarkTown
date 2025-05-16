import { 
  users, type User, type InsertUser, 
  locations, type Location, type InsertLocation,
  favorites, type Favorite, type InsertFavorite,
  reviews, type Review, type InsertReview
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Locations
  getLocations(): Promise<Location[]>;
  getLocationsByCategory(category: string): Promise<Location[]>;
  getLocationById(id: number): Promise<Location | undefined>;
  searchLocations(query: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Favorites
  getFavoritesByUserId(userId: number): Promise<Location[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, locationId: number): Promise<boolean>;
  isFavorite(userId: number, locationId: number): Promise<boolean>;
  
  // Reviews
  getReviewsByLocationId(locationId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  addReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  getReview(id: number): Promise<Review | undefined>;
  getUserReviewForLocation(userId: number, locationId: number): Promise<Review | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private favorites: Map<number, Favorite>;
  private reviews: Map<number, Review>;
  private userIdCounter: number;
  private locationIdCounter: number;
  private favoriteIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.favorites = new Map();
    this.reviews = new Map();
    this.userIdCounter = 1;
    this.locationIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.reviewIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocationsByCategory(category: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.category === category
    );
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async searchLocations(query: string): Promise<Location[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.locations.values()).filter(
      (location) => 
        location.name.toLowerCase().includes(lowerQuery) ||
        location.description.toLowerCase().includes(lowerQuery) ||
        location.category.toLowerCase().includes(lowerQuery) ||
        location.address.toLowerCase().includes(lowerQuery) ||
        location.features.toLowerCase().includes(lowerQuery)
    );
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationIdCounter++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  // Favorites methods
  async getFavoritesByUserId(userId: number): Promise<Location[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
    
    return userFavorites.map(favorite => 
      this.locations.get(favorite.locationId)!
    ).filter(Boolean);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, locationId: number): Promise<boolean> {
    const favoriteToRemove = Array.from(this.favorites.values()).find(
      (favorite) => favorite.userId === userId && favorite.locationId === locationId
    );
    
    if (favoriteToRemove) {
      this.favorites.delete(favoriteToRemove.id);
      return true;
    }
    
    return false;
  }

  async isFavorite(userId: number, locationId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.locationId === locationId
    );
  }
  
  // Review methods
  async getReviewsByLocationId(locationId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.locationId === locationId
    );
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }

  async addReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { ...insertReview, id, createdAt };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: number, reviewUpdate: Partial<InsertReview>): Promise<Review | undefined> {
    const existingReview = this.reviews.get(id);
    if (!existingReview) {
      return undefined;
    }
    
    const updatedReview = { ...existingReview, ...reviewUpdate };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getUserReviewForLocation(userId: number, locationId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.locationId === locationId
    );
  }
  
  // Initialize sample data
  private initSampleData() {
    // Sample locations
    const sampleLocations: InsertLocation[] = [
      {
        name: "Paws & Coffee",
        description: "A cozy coffee shop with outdoor seating and dog treats",
        category: "cafe",
        address: "123 Main St, Downtown",
        latitude: 37.7749,
        longitude: -122.4194,
        rating: 4.2,
        reviewCount: 120,
        imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3",
        features: "Water bowls provided,Outdoor seating,Pet treats",
        distanceMiles: 0.3,
      },
      {
        name: "Barking Bistro",
        description: "Restaurant with dedicated dog-friendly seating area",
        category: "restaurant",
        address: "456 Park Ave, Downtown",
        latitude: 37.7739,
        longitude: -122.4312,
        rating: 4.9,
        reviewCount: 203,
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3",
        features: "Special dog menu,Patio seating,Water bowls",
        distanceMiles: 0.7,
      },
      {
        name: "Central Bark Park",
        description: "Large off-leash dog park with separate areas for small and large dogs",
        category: "park",
        address: "789 Green St, Downtown",
        latitude: 37.7829,
        longitude: -122.4324,
        rating: 4.8,
        reviewCount: 356,
        imageUrl: "https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3",
        features: "Off-leash area,Water fountains,Waste stations,Separate area for small dogs",
        distanceMiles: 1.2,
      },
      {
        name: "Tail Waggers Pet Shop",
        description: "Pet supply store that welcomes dogs inside",
        category: "shop",
        address: "321 Oak St, Downtown",
        latitude: 37.7869,
        longitude: -122.4254,
        rating: 4.5,
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3",
        features: "Dogs allowed inside,Free samples,Pet measuring station",
        distanceMiles: 0.5,
      },
      {
        name: "Pup-Friendly Brewery",
        description: "Craft brewery with covered outdoor patio for dogs",
        category: "restaurant",
        address: "555 Brew St, Downtown",
        latitude: 37.7849,
        longitude: -122.4294,
        rating: 4.7,
        reviewCount: 175,
        imageUrl: "https://images.unsplash.com/photo-1516647355350-5318acd8c083?ixlib=rb-4.0.3",
        features: "Dog-friendly patio,Water stations,Occasional pet events",
        distanceMiles: 0.8,
      },
      {
        name: "Canine Commons Park",
        description: "Small neighborhood park with dedicated dog area",
        category: "park",
        address: "222 Elm St, Downtown",
        latitude: 37.7879,
        longitude: -122.4159,
        rating: 4.3,
        reviewCount: 97,
        imageUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3",
        features: "Fenced area,Water fountain,Shaded benches",
        distanceMiles: 1.1,
      },
      {
        name: "Doggie Daylight Cafe",
        description: "Breakfast cafe with dedicated dog patio section",
        category: "cafe",
        address: "777 Sunny Ave, Downtown",
        latitude: 37.7819,
        longitude: -122.4129,
        rating: 4.6,
        reviewCount: 145,
        imageUrl: "https://images.unsplash.com/photo-1545341425-7626c6103e77?ixlib=rb-4.0.3",
        features: "Dog patio,Doggie breakfast options,Water bowls",
        distanceMiles: 0.6,
      },
      {
        name: "Paws & Threads Boutique",
        description: "Pet fashion boutique that welcomes pets inside",
        category: "shop",
        address: "888 Fashion Blvd, Downtown",
        latitude: 37.7809,
        longitude: -122.4119,
        rating: 4.4,
        reviewCount: 76,
        imageUrl: "https://images.unsplash.com/photo-1598875184988-5e67b1a874b8?ixlib=rb-4.0.3",
        features: "Pets welcome inside,Fitting area,Dog treats at checkout",
        distanceMiles: 0.9,
      }
    ];
    
    // Create sample locations
    sampleLocations.forEach(location => {
      this.createLocation(location);
    });
    
    // Sample user
    this.createUser({
      username: "dogLover",
      password: "password123"
    });
    
    // Sample favorites for the user
    this.addFavorite({
      userId: 1,
      locationId: 1
    });
    
    this.addFavorite({
      userId: 1,
      locationId: 3
    });
  }
}

export const storage = new MemStorage();
