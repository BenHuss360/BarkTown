import { 
  users, type User, type InsertUser, 
  locations, type Location, type InsertLocation,
  favorites, type Favorite, type InsertFavorite,
  reviews, type Review, type InsertReview,
  locationSuggestions, type LocationSuggestion, type InsertLocationSuggestion
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;
  
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
  
  // Location Suggestions
  getSuggestions(): Promise<LocationSuggestion[]>;
  getSuggestionsByUser(userId: number): Promise<LocationSuggestion[]>;
  getSuggestionById(id: number): Promise<LocationSuggestion | undefined>;
  createSuggestion(suggestion: InsertLocationSuggestion): Promise<LocationSuggestion>;
  updateSuggestionStatus(id: number, status: string): Promise<LocationSuggestion | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private favorites: Map<number, Favorite>;
  private reviews: Map<number, Review>;
  private suggestions: Map<number, LocationSuggestion>;
  private userIdCounter: number;
  private locationIdCounter: number;
  private favoriteIdCounter: number;
  private reviewIdCounter: number;
  private suggestionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.favorites = new Map();
    this.reviews = new Map();
    this.suggestions = new Map();
    this.userIdCounter = 1;
    this.locationIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.reviewIdCounter = 1;
    this.suggestionIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  // User methods with paw points support
  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    // Update points (initialize if not set)
    const currentPoints = user.pawPoints || 0;
    const updatedUser = { ...user, pawPoints: currentPoints + points };
    this.users.set(userId, updatedUser);
    return updatedUser;
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
    const user: User = { ...insertUser, id, pawPoints: 0 };
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
    // Ensure photoUrl is either a string or null, not undefined
    const photoUrl = insertReview.photoUrl || null;
    const review: Review = { ...insertReview, photoUrl, id, createdAt };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: number, reviewUpdate: Partial<InsertReview>): Promise<Review | undefined> {
    const existingReview = this.reviews.get(id);
    if (!existingReview) {
      return undefined;
    }
    
    // Ensure photoUrl is either a string or null, not undefined
    const photoUrl = reviewUpdate.photoUrl !== undefined ? reviewUpdate.photoUrl || null : existingReview.photoUrl;
    const updatedReview = { ...existingReview, ...reviewUpdate, photoUrl };
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
  
  // Location suggestion methods
  async getSuggestions(): Promise<LocationSuggestion[]> {
    return Array.from(this.suggestions.values());
  }
  
  async getSuggestionsByUser(userId: number): Promise<LocationSuggestion[]> {
    return Array.from(this.suggestions.values()).filter(
      (suggestion) => suggestion.userId === userId
    );
  }
  
  async getSuggestionById(id: number): Promise<LocationSuggestion | undefined> {
    return this.suggestions.get(id);
  }
  
  async createSuggestion(insertSuggestion: InsertLocationSuggestion): Promise<LocationSuggestion> {
    const id = this.suggestionIdCounter++;
    const createdAt = new Date();
    const status = "pending";
    
    // Ensure latitude and longitude are null if not provided
    const latitude = insertSuggestion.latitude !== undefined ? insertSuggestion.latitude : null;
    const longitude = insertSuggestion.longitude !== undefined ? insertSuggestion.longitude : null;
    // Ensure photoUrl is null if not provided
    const photoUrl = insertSuggestion.photoUrl || null;
    
    // Create a fresh suggestion object with all required fields
    const suggestion: LocationSuggestion = { 
      id,
      name: insertSuggestion.name,
      description: insertSuggestion.description,
      category: insertSuggestion.category,
      address: insertSuggestion.address,
      latitude,
      longitude,
      features: insertSuggestion.features,
      userId: insertSuggestion.userId,
      photoUrl,
      status, 
      createdAt 
    };
    
    this.suggestions.set(id, suggestion);
    return suggestion;
  }
  
  async updateSuggestionStatus(id: number, status: string): Promise<LocationSuggestion | undefined> {
    const suggestion = this.suggestions.get(id);
    if (!suggestion) {
      return undefined;
    }
    
    // Note: The approval handling has been moved below to avoid duplication
    
    // Update the suggestion status
    const updatedSuggestion = { ...suggestion, status };
    
    // Store the updated suggestion
    this.suggestions.set(id, updatedSuggestion);
    
    // If we're approving the suggestion, we need to also update our locations database
    if (status === "approved") {
      // Create a proper location object from the suggestion
      const newLocation: InsertLocation = {
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category,
        address: suggestion.address,
        latitude: suggestion.latitude || 37.7749,
        longitude: suggestion.longitude || -122.4194,
        rating: 4.0, // Start with a good rating
        reviewCount: 1, // Start with one review
        imageUrl: suggestion.photoUrl || "https://images.unsplash.com/photo-1610041321420-a489049a5616?q=80&w=2070",
        features: suggestion.features,
        distanceMiles: 0.5 // Default distance
      };
      
      // Add to locations database
      this.createLocation(newLocation);
      
      // Award 5 points to the user who submitted the suggestion
      this.updateUserPoints(suggestion.userId, 5);
      
      console.log(`Added approved location: ${suggestion.name}`);
    }
    
    return updatedSuggestion;
  }
  
  // Initialize sample data
  private initSampleData() {
    // Reset the suggestionIdCounter to ensure we start fresh
    this.suggestionIdCounter = 1;
    
    // Add a sample suggestion for user 1
    const sampleSuggestion: InsertLocationSuggestion = {
      name: "Dog Park Cafe",
      description: "A cafe with a dedicated dog play area",
      category: "cafe",
      address: "789 Bark Street, Downtown",
      features: "Dog play area,Water bowls,Dog treats",
      userId: 1,
      latitude: 37.7852,
      longitude: -122.4001
    };
    
    // Create the suggestion
    this.createSuggestion(sampleSuggestion);
    
    // Sample reviews (to be added after sample locations)
    
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
    
    // Sample reviews to showcase the review functionality
    const sampleReviews: InsertReview[] = [
      {
        userId: 1,
        locationId: 1,
        rating: 5,
        content: "Absolutely loved this place! My dog was welcomed with treats and water. The outdoor seating area was perfect for us to relax. Will definitely be back!",
        photoUrl: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-4.0.3&q=85"
      },
      {
        userId: 1,
        locationId: 3,
        rating: 4,
        content: "Great park with lots of space for dogs to run around. The off-leash area was clean and well maintained. My pup had a blast playing with other dogs here!",
        photoUrl: null
      },
      {
        userId: 1,
        locationId: 7,
        rating: 3,
        content: "Decent place for dogs, but could use more shade in the outdoor dining area. The staff was friendly though and provided water bowls.",
        photoUrl: null
      }
    ];
    
    // Create sample reviews
    sampleReviews.forEach(review => this.addReview(review));
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentPoints = user.pawPoints || 0;
    const [updatedUser] = await db
      .update(users)
      .set({ pawPoints: currentPoints + points })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }

  async getLocationsByCategory(category: string): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.category, category));
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async searchLocations(query: string): Promise<Location[]> {
    const lowerQuery = query.toLowerCase();
    // Use SQL LIKE for text search
    return db.select().from(locations).where(
      or(
        sql`lower(${locations.name}) like ${`%${lowerQuery}%`}`,
        sql`lower(${locations.description}) like ${`%${lowerQuery}%`}`,
        sql`lower(${locations.category}) like ${`%${lowerQuery}%`}`,
        sql`lower(${locations.address}) like ${`%${lowerQuery}%`}`,
        sql`lower(${locations.features}) like ${`%${lowerQuery}%`}`
      )
    );
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  // Favorites methods
  async getFavoritesByUserId(userId: number): Promise<Location[]> {
    const result = await db
      .select({
        location: locations
      })
      .from(locations)
      .innerJoin(favorites, eq(locations.id, favorites.locationId))
      .where(eq(favorites.userId, userId));
    
    return result.map(item => item.location);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async removeFavorite(userId: number, locationId: number): Promise<boolean> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.locationId, locationId)
        )
      );
    return true; // PostgreSQL driver doesn't return count easily, so we'll just return true
  }

  async isFavorite(userId: number, locationId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.locationId, locationId)
        )
      );
    return !!favorite;
  }

  // Review methods
  async getReviewsByLocationId(locationId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.locationId, locationId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async addReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: number, reviewUpdate: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(reviewUpdate)
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true; // PostgreSQL driver doesn't return count easily
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getUserReviewForLocation(userId: number, locationId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.locationId, locationId)
        )
      );
    return review;
  }

  // Location Suggestions methods
  async getSuggestions(): Promise<LocationSuggestion[]> {
    return db.select().from(locationSuggestions).orderBy(desc(locationSuggestions.createdAt));
  }

  async getSuggestionsByUser(userId: number): Promise<LocationSuggestion[]> {
    return db
      .select()
      .from(locationSuggestions)
      .where(eq(locationSuggestions.userId, userId))
      .orderBy(desc(locationSuggestions.createdAt));
  }

  async getSuggestionById(id: number): Promise<LocationSuggestion | undefined> {
    const [suggestion] = await db
      .select()
      .from(locationSuggestions)
      .where(eq(locationSuggestions.id, id));
    return suggestion;
  }

  async createSuggestion(insertSuggestion: InsertLocationSuggestion): Promise<LocationSuggestion> {
    const [suggestion] = await db
      .insert(locationSuggestions)
      .values(insertSuggestion)
      .returning();
    return suggestion;
  }

  async updateSuggestionStatus(id: number, status: string): Promise<LocationSuggestion | undefined> {
    // First get the suggestion
    const suggestion = await this.getSuggestionById(id);
    if (!suggestion) return undefined;

    // Update the suggestion status
    const [updatedSuggestion] = await db
      .update(locationSuggestions)
      .set({ status })
      .where(eq(locationSuggestions.id, id))
      .returning();

    // If we're approving the suggestion, add it to the locations table
    if (status === "approved") {
      // Create a proper location from the suggestion
      await this.createLocation({
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category,
        address: suggestion.address,
        latitude: suggestion.latitude || 37.7749,
        longitude: suggestion.longitude || -122.4194,
        rating: 4.0, // Start with a good rating
        reviewCount: 1, // Start with one review
        imageUrl: suggestion.photoUrl || "https://images.unsplash.com/photo-1610041321420-a489049a5616?q=80&w=2070",
        features: suggestion.features,
        distanceMiles: 0.5 // Default distance
      });

      // Award 5 points to the user who submitted the suggestion
      await this.updateUserPoints(suggestion.userId, 5);
      
      console.log(`Added approved location: ${suggestion.name}`);
    }

    return updatedSuggestion;
  }
}

// Import necessary Drizzle functions
import { db } from './db';
import { eq, and, or, desc, sql } from 'drizzle-orm';

// Use the database storage implementation
export const storage = new DatabaseStorage();
