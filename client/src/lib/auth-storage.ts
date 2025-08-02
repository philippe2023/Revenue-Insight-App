// Simple client-side storage for user data to bypass session issues
import { User } from "@shared/schema";

const AUTH_STORAGE_KEY = 'hotelcast_user';

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}