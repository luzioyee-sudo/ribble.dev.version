import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  userId: text('user_id'),
  anonymousId: text('anonymous_id'),
  sessionId: text('session_id').notNull(),
  eventName: text('event_name').notNull(),
  eventCategory: text('event_category').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  route: text('route'),
  page: text('page'),
  elementId: text('element_id'),
  languageId: text('language_id'),
  languageProfileId: text('language_profile_id'),
  deviceType: text('device_type'),
  viewport: text('viewport'),
  metadata: text('metadata'), // Stringified JSON to handle flexible structures safely
  createdAt: timestamp('created_at').defaultNow(),
});

