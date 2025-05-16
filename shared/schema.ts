import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  pawPoints: integer("paw_points").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Location model
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // restaurant, cafe, park, shop
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  rating: doublePrecision("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  imageUrl: text("image_url").notNull(),
  features: text("features").notNull(), // Comma-separated list of features
  distanceMiles: doublePrecision("distance_miles").notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

// Favorites model
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

// Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  content: text("content").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Location suggestions model
export const locationSuggestions = pgTable("location_suggestions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  features: text("features").notNull(),
  userId: integer("user_id").notNull(),
  photoUrl: text("photo_url"), // Optional photo upload
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSuggestionSchema = createInsertSchema(locationSuggestions).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertLocationSuggestion = z.infer<typeof insertLocationSuggestionSchema>;
export type LocationSuggestion = typeof locationSuggestions.$inferSelect;
