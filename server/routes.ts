import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFavoriteSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
