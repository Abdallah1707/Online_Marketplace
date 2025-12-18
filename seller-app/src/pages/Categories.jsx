// seller-app/src/pages/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const loadCategories = async () => {
    setLoadingList(true);
    setError("");

    try {
      // Public list endpoint [file:14]
      const { data } = await api.get("/public/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load categories");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      // Seller create endpoint [file:5][file:13]
      await api.post("/seller/categories", {
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      await loadCategories();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    const ok = window.confirm("Delete this category? Products in this category will be set to 'No category'.");
    if (!ok) return;

    setError("");

    try {
      // Seller delete endpoint [file:5][file:13]
      await api.delete(`/seller/categories/${categoryId}`);
      await loadCategories();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to delete category");
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Categories</h1>
        <button className="refresh-btn" onClick={loadCategories} disabled={loadingList}>
          {loadingList ? "🔄 Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && <div className="categories-error">{error}</div>}

      <div className="categories-content">
        {/* Create Category Card */}
        <div className="create-category-card">
          <h2>Create Category</h2>

          <form onSubmit={handleCreate} className="create-category-form">
            <div className="form-field">
              <label>
                Name <span className="required-mark">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of the category"
              />
            </div>

            <button type="submit" className="create-btn" disabled={!canSubmit || submitting}>
              {submitting ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* Existing Categories */}
        <div className="existing-categories">
          <h2>Existing Categories</h2>

          {loadingList ? (
            <div className="categories-loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="categories-empty">
              No categories yet. Create your first category to organize your products.
            </div>
          ) : (
            <div className="categories-list">
              {categories.map((c) => (
                <div key={c._id} className="category-item">
                  <div className="category-info">
                    <div className="category-name">{c.name}</div>
                    {c.description && (
                      <div className="category-description">{c.description}</div>
                    )}
                    <div className="category-id">ID: {c._id}</div>
                  </div>

                  <button className="delete-btn" onClick={() => handleDelete(c._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
