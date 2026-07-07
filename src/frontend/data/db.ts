import { Dress } from '../types';

const ADMIN_SESSION_KEY = 'fashion_catalog_admin_session';

const readApiErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = await res.json();
    if (typeof body?.error === 'string' && body.error.trim()) {
      return body.error;
    }
  } catch {
    // Fall through to a generic message when the response is not JSON.
  }

  return `Request failed with status ${res.status}`;
};

// Dress DB CRUD methods using Express API proxying to Cloud SQL Postgres
export const getDresses = async (): Promise<Dress[]> => {
  try {
    const res = await fetch('/api/dresses');
    if (!res.ok) throw new Error('Failed to fetch dresses');
    return await res.json() as Dress[];
  } catch (e) {
    console.error('Error fetching dresses', e);
    return [];
  }
};

export const addDress = async (dress: Omit<Dress, 'id' | 'createdAt'>): Promise<Dress> => {
  const res = await fetch('/api/dresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dress)
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return await res.json() as Dress;
};

export const updateDress = async (id: string, updatedFields: Partial<Dress>): Promise<Dress> => {
  const res = await fetch(`/api/dresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields)
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return await res.json() as Dress;
};

export const deleteDress = async (id: string): Promise<void> => {
  const res = await fetch(`/api/dresses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
};

// Admin Auth Helper Methods
export const isAdminAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (auth: boolean): void => {
  try {
    if (auth) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error setting admin session', e);
  }
};
