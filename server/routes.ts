import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFavoriteSchema, insertReviewSchema, insertLocationSuggestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all locations
  app.get("/api/locations", async (_req: Request, res: Response) => {
    try {
      const locations = await storage.getLocations();
      return res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      return res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get location by id
  app.get("/api/locations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }

      const location = await storage.getLocationById(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      return res.json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      return res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // Get locations by category
  app.get("/api/locations/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const locations = await storage.getLocationsByCategory(category);
      return res.json(locations);
    } catch (error) {
      console.error("Error fetching locations by category:", error);
      return res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Search locations
  app.get("/api/locations/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      const locations = await storage.searchLocations(query);
      return res.json(locations);
    } catch (error) {
      console.error("Error searching locations:", error);
      return res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Get user's favorite locations
  app.get("/api/favorites/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const favorites = await storage.getFavoritesByUserId(userId);
      return res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add a location to user's favorites
  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const validationResult = insertFavoriteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid favorite data",
          errors: validationResult.error.errors 
        });
      }
      
      const favorite = await storage.addFavorite(validationResult.data);
      return res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      return res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove a location from user's favorites
  app.delete("/api/favorites/:userId/:locationId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const locationId = parseInt(req.params.locationId);
      
      if (isNaN(userId) || isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid user or location ID" });
      }

      const removed = await storage.removeFavorite(userId, locationId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      return res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Check if a location is in user's favorites
  app.get("/api/favorites/:userId/:locationId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const locationId = parseInt(req.params.locationId);
      
      if (isNaN(userId) || isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid user or location ID" });
      }

      const isFavorite = await storage.isFavorite(userId, locationId);
      return res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Reviews Routes
  // Get reviews for a location
  app.get("/api/locations/:locationId/reviews", async (req: Request, res: Response) => {
    try {
      const locationId = parseInt(req.params.locationId);
      
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const reviews = await storage.getReviewsByLocationId(locationId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Get reviews by a user
  app.get("/api/users/:userId/reviews", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const reviews = await storage.getUserReviews(userId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      return res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });
  
  // Create a new review
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const validationResult = insertReviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid review data",
          errors: validationResult.error.errors 
        });
      }
      
      const review = await storage.addReview(validationResult.data);
      return res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  // Update a review
  app.put("/api/reviews/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const existingReview = await storage.getReview(id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Partial validation of the update data
      const validationResult = insertReviewSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid review data",
          errors: validationResult.error.errors 
        });
      }
      
      const updatedReview = await storage.updateReview(id, validationResult.data);
      return res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      return res.status(500).json({ message: "Failed to update review" });
    }
  });
  
  // Delete a review
  app.delete("/api/reviews/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const success = await storage.deleteReview(id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ message: "Failed to delete review" });
    }
  });
  
  // Check if user has already reviewed a location
  app.get("/api/users/:userId/locations/:locationId/review", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const locationId = parseInt(req.params.locationId);
      
      if (isNaN(userId) || isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid user ID or location ID" });
      }
      
      const review = await storage.getUserReviewForLocation(userId, locationId);
      return res.json({ hasReview: !!review, review });
    } catch (error) {
      console.error("Error checking review status:", error);
      return res.status(500).json({ message: "Failed to check review status" });
    }
  });
  
  // Location Suggestion Routes
  
  // Get all location suggestions (for admin)
  app.get("/api/suggestions", async (_req: Request, res: Response) => {
    try {
      const suggestions = await storage.getSuggestions();
      return res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return res.status(500).json({ message: "Failed to fetch location suggestions" });
    }
  });
  
  // Get suggestions by a specific user
  app.get("/api/users/:userId/suggestions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const suggestions = await storage.getSuggestionsByUser(userId);
      return res.json(suggestions);
    } catch (error) {
      console.error("Error fetching user suggestions:", error);
      return res.status(500).json({ message: "Failed to fetch user's location suggestions" });
    }
  });
  
  // Submit a new location suggestion
  app.post("/api/locations/suggest", async (req: Request, res: Response) => {
    try {
      const validationResult = insertLocationSuggestionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid location suggestion data", 
          errors: validationResult.error.errors 
        });
      }
      
      const suggestion = await storage.createSuggestion(validationResult.data);
      return res.status(201).json(suggestion);
    } catch (error) {
      console.error("Error creating suggestion:", error);
      return res.status(500).json({ message: "Failed to submit location suggestion" });
    }
  });
  
  // Update suggestion status (admin only)
  app.put("/api/suggestions/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid suggestion ID" });
      }
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedSuggestion = await storage.updateSuggestionStatus(id, status);
      
      if (!updatedSuggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      return res.json(updatedSuggestion);
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      return res.status(500).json({ message: "Failed to update suggestion status" });
    }
  });
  
  // Get user paw points
  app.get("/api/users/:userId/points", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({ userId, pawPoints: user.pawPoints || 0 });
    } catch (error) {
      console.error("Error fetching user points:", error);
      return res.status(500).json({ message: "Failed to fetch user paw points" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
