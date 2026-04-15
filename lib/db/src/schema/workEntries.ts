import { pgTable, text, serial, integer, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const workEntriesTable = pgTable("work_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  labourCount: integer("labour_count").notNull(),
  squareMeter: real("square_meter").notNull(),
  workingChannel: text("working_channel").notNull(),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWorkEntrySchema = createInsertSchema(workEntriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkEntry = z.infer<typeof insertWorkEntrySchema>;
export type WorkEntry = typeof workEntriesTable.$inferSelect;
