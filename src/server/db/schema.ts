import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("admin"),
  orgName: text("org_name").default("OM Realty Homes"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  nationality: text("nationality"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "rented",
  "sold",
]);

export const typeStatusEnum = pgEnum("type_status", ["active", "inactive"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "unpaid",
  "pending",
  "inactive",
]);

export const dealTypeEnum = pgEnum("deal_type", ["sale", "rent", "lease"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "bank",
  "card",
]);

export const dealStatusEnum = pgEnum("deal_status", [
  "active",
  "pending",
  "completed",
  "inactive",
]);

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

export const propertyTypes = pgTable("property_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: typeStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const owners = pgTable("owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  typeId: uuid("type_id").references(() => propertyTypes.id, {
    onDelete: "set null",
  }),
  location: text("location").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  status: propertyStatusEnum("status").notNull().default("available"),
  ownerId: uuid("owner_id").references(() => owners.id, {
    onDelete: "set null",
  }),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  occupation: text("occupation"),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  moveInDate: timestamp("move_in_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  ownerId: uuid("owner_id").references(() => owners.id, {
    onDelete: "set null",
  }),
  tenantId: uuid("tenant_id").references(() => tenants.id, {
    onDelete: "set null",
  }),
  dealType: dealTypeEnum("deal_type").notNull().default("sale"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dealDate: timestamp("deal_date").notNull().defaultNow(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("bank"),
  status: dealStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const propertyTypesRelations = relations(propertyTypes, ({ many }) => ({
  properties: many(properties),
}));

export const ownersRelations = relations(owners, ({ many }) => ({
  properties: many(properties),
  deals: many(deals),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  type: one(propertyTypes, {
    fields: [properties.typeId],
    references: [propertyTypes.id],
  }),
  owner: one(owners, {
    fields: [properties.ownerId],
    references: [owners.id],
  }),
  tenants: many(tenants),
  deals: many(deals),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  property: one(properties, {
    fields: [tenants.propertyId],
    references: [properties.id],
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  property: one(properties, {
    fields: [deals.propertyId],
    references: [properties.id],
  }),
  owner: one(owners, { fields: [deals.ownerId], references: [owners.id] }),
  tenant: one(tenants, {
    fields: [deals.tenantId],
    references: [tenants.id],
  }),
}));
