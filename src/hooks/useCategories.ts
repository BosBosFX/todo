import { useState, useEffect, useCallback } from "react";
import type { Category } from "../types/category";
import { fetchCategories } from "../services/categories";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Categories] Attempting to fetch from API...");
      const apiCategories = await fetchCategories();
      setCategories(apiCategories);
      console.log("[Categories] Loaded from API");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
      console.error("[Categories] Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
};
