import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, pool } from '../db/index.ts';
import { dresses } from '../db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { INITIAL_DRESSES } from '../data/seedData.ts';

const DEFAULT_CURRENCY = '₹';

let isDatabaseOffline = false;
let inMemoryDresses = [...INITIAL_DRESSES];

async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uid VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dresses (
      id VARCHAR(255) PRIMARY KEY,
      order_number INT NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price INT NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT '₹',
      images JSON NOT NULL,
      sizes JSON NOT NULL,
      colors JSON NOT NULL,
      material VARCHAR(255) NOT NULL,
      specifications JSON NOT NULL,
      tags JSON NOT NULL,
      purchase_link TEXT NOT NULL,
      created_at VARCHAR(255) NOT NULL
    );
  `);
}

async function tryEnsureDatabaseSchema() {
  const isDatabaseConfigured = Boolean(process.env.DATABASE_URL || process.env.SQL_HOST);
  if (!isDatabaseConfigured) {
    console.warn('[AI Studio] Database environment variables are not configured. Using in-memory fallback.');
    isDatabaseOffline = true;
    return;
  }

  try {
    // Prevent server startup hangs by racing schema check with a 2-second timeout
    const schemaPromise = ensureDatabaseSchema();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database schema check timed out (2s)')), 2000)
    );
    await Promise.race([schemaPromise, timeoutPromise]);
    console.log('Database schema is ready.');
  } catch (error: any) {
    console.error('Database schema setup failed or timed out. Using in-memory fallback.');
    console.error(error);
    isDatabaseOffline = true;
  }
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
}

function readSpecifications(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .flatMap(([key, val]) => {
        if (!key.trim() || typeof val !== 'string') {
          return [];
        }

        return [[key.trim(), val.trim()]];
      })
  );
}

function buildDressPayload(payload: any, orderNumber: number) {
  const price = Number(payload.price);

  return {
    id: readString(payload.id) || `dress-${Date.now()}`,
    orderNumber,
    name: readString(payload.name),
    brand: readString(payload.brand),
    category: readString(payload.category),
    description: readString(payload.description),
    price: Number.isFinite(price) ? Math.round(price) : 0,
    currency: readString(payload.currency, DEFAULT_CURRENCY) || DEFAULT_CURRENCY,
    images: readStringArray(payload.images),
    sizes: readStringArray(payload.sizes),
    colors: readStringArray(payload.colors),
    material: readString(payload.material),
    specifications: readSpecifications(payload.specifications),
    tags: readStringArray(payload.tags),
    purchaseLink: readString(payload.purchaseLink),
    createdAt: new Date().toISOString(),
  };
}

function validateDressPayload(dress: ReturnType<typeof buildDressPayload>) {
  if (!dress.name) return 'Dress name is required';
  if (!dress.brand) return 'Brand is required';
  if (!dress.category) return 'Category is required';
  if (!dress.description) return 'Description is required';
  if (dress.price <= 0) return 'Price must be greater than zero';
  if (!dress.material) return 'Material is required';
  if (!dress.purchaseLink) return 'External purchase link is required';
  if (dress.images.length === 0) return 'At least one product image is required';
  return null;
}

async function getNextOrderNumber() {
  if (isDatabaseOffline) {
    const currentMax = inMemoryDresses.reduce((max, d) => Math.max(max, d.orderNumber), 1000);
    return currentMax + 1;
  }
  const result = await db.select({ maxOrderNumber: sql<number>`max(${dresses.orderNumber})` }).from(dresses);
  const currentMax = result[0]?.maxOrderNumber ?? 1000;
  return currentMax + 1;
}

async function resolveUniqueOrderNumber(requestedOrderNumber?: unknown) {
  const numericOrderNumber = Number(requestedOrderNumber);

  if (Number.isInteger(numericOrderNumber) && numericOrderNumber > 0) {
    if (isDatabaseOffline) {
      const existing = inMemoryDresses.find(d => d.orderNumber === numericOrderNumber);
      if (!existing) {
        return numericOrderNumber;
      }
    } else {
      const existing = await db.select({ id: dresses.id }).from(dresses).where(eq(dresses.orderNumber, numericOrderNumber));
      if (existing.length === 0) {
        return numericOrderNumber;
      }
    }
  }

  return await getNextOrderNumber();
}

async function startServer() {
  await tryEnsureDatabaseSchema();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support large payloads (for base64 uploaded images)
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/dresses', async (req, res) => {
    if (isDatabaseOffline) {
      const list = [...inMemoryDresses];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(list);
    }

    try {
      let list = await db.select().from(dresses);
      if (list.length === 0) {
        console.log('Seeding initial dresses into Cloud SQL...');
        await db.insert(dresses).values(INITIAL_DRESSES);
        list = await db.select().from(dresses);
      }
      
      // Sort: newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get dresses from database, falling back to in-memory:', error);
      isDatabaseOffline = true;
      const list = [...inMemoryDresses];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(list);
    }
  });

  app.post('/api/dresses', async (req, res) => {
    try {
      const payload = req.body;
      const orderNumber = await resolveUniqueOrderNumber(payload.orderNumber);
      const newDress = buildDressPayload(payload, orderNumber);
      const validationError = validateDressPayload(newDress);

      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (isDatabaseOffline) {
        inMemoryDresses.push(newDress);
        return res.json(newDress);
      }

      await db.insert(dresses).values(newDress);
      res.json(newDress);
    } catch (error: any) {
      console.error('Failed to insert dress, falling back to in-memory:', error);
      isDatabaseOffline = true;
      try {
        const payload = req.body;
        const orderNumber = inMemoryDresses.reduce((max, d) => Math.max(max, d.orderNumber), 1000) + 1;
        const newDress = buildDressPayload(payload, orderNumber);
        const validationError = validateDressPayload(newDress);
        if (validationError) {
          return res.status(400).json({ error: validationError });
        }
        inMemoryDresses.push(newDress);
        res.json(newDress);
      } catch (fallbackError: any) {
        console.error('In-memory insert fallback also failed:', fallbackError);
        res.status(500).json({ error: 'Failed to create dress' });
      }
    }
  });

  app.put('/api/dresses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const { id: _, createdAt: __, ...updateFields } = payload;

      if (isDatabaseOffline) {
        const index = inMemoryDresses.findIndex(d => d.id === id);
        if (index === -1) {
          return res.status(404).json({ error: 'Dress not found' });
        }
        inMemoryDresses[index] = {
          ...inMemoryDresses[index],
          ...updateFields,
        };
        return res.json(inMemoryDresses[index]);
      }

      await db.update(dresses).set(updateFields).where(eq(dresses.id, id));
      
      const updated = await db.select().from(dresses).where(eq(dresses.id, id));
      if (updated.length === 0) {
        // Try fallback in case it was created in memory
        const index = inMemoryDresses.findIndex(d => d.id === id);
        if (index !== -1) {
          inMemoryDresses[index] = {
            ...inMemoryDresses[index],
            ...updateFields,
          };
          return res.json(inMemoryDresses[index]);
        }
        return res.status(404).json({ error: 'Dress not found' });
      }
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Failed to update dress, falling back to in-memory:', error);
      isDatabaseOffline = true;
      const { id } = req.params;
      const payload = req.body;
      const { id: _, createdAt: __, ...updateFields } = payload;
      const index = inMemoryDresses.findIndex(d => d.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Dress not found' });
      }
      inMemoryDresses[index] = {
        ...inMemoryDresses[index],
        ...updateFields,
      };
      res.json(inMemoryDresses[index]);
    }
  });

  app.delete('/api/dresses/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (isDatabaseOffline) {
        inMemoryDresses = inMemoryDresses.filter(d => d.id !== id);
        return res.json({ success: true });
      }

      await db.delete(dresses).where(eq(dresses.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to delete dress, falling back to in-memory:', error);
      isDatabaseOffline = true;
      const { id } = req.params;
      inMemoryDresses = inMemoryDresses.filter(d => d.id !== id);
      res.json({ success: true });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
