import { mysqlTable, varchar, int, json, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dresses = mysqlTable('dresses', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orderNumber: int('order_number').notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }).notNull(),
  price: int('price').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('₹'),
  images: json('images').$type<string[]>().notNull(),
  sizes: json('sizes').$type<string[]>().notNull(),
  colors: json('colors').$type<string[]>().notNull(),
  material: varchar('material', { length: 255 }).notNull(),
  specifications: json('specifications').$type<Record<string, string>>().notNull(),
  tags: json('tags').$type<string[]>().notNull(),
  purchaseLink: varchar('purchase_link', { length: 1000 }).notNull(),
  createdAt: varchar('created_at', { length: 255 }).notNull(),
});
