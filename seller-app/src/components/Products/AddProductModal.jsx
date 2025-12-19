// seller-app/src/components/Products/AddProductModal.jsx
import { useEffect, useMemo, useState } from "react";
import "./Modal.css";

import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "", // empty means "No category"
  deliveryDays: "1", // delivery time estimate in days
};

export default function AddProductModal({ open, onClose, onCreated, editingProduct }) {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingProduct;

  const isValid = useMemo(() => {
    if (!form.title.trim()) return false;
    if (form.price === "" || Number.isNaN(Number(form.price))) return false;
    if (form.deliveryDays === "" || Number.isNaN(Number(form.deliveryDays)) || Number(form.deliveryDays) < 1) return false;
    return true;
  }, [form.title, form.price, form.deliveryDays]);

  useEffect(() => {
    if (!open) return;

    setError("");
    
    // Load product data if editing
    if (editingProduct) {
      setForm({
        title: editingProduct.title || "",
        description: editingProduct.description || "",
        price: editingProduct.price?.toString() || "",
        category: editingProduct.category?._id || editingProduct.category || "",
        deliveryDays: editingProduct.deliveryDays?.toString() || "1",
      });
    } else {
      setForm(initialForm);
    }

    setLoadingCategories(true);

    categoryService
      .list()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => {
        setCategories([]);
        setError(e?.response?.data?.error || e?.message || "Failed to load categories");
      })
      .finally(() => setLoadingCategories(false));
  }, [open, editingProduct]);

  if (!open) return null;

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category, // can be "" -> productService will omit
        deliveryDays: Number(form.deliveryDays),
      };

      if (isEditing) {
        await productService.updateProduct(editingProduct._id || editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setForm(initialForm);
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="modal__subtitle">
              {isEditing 
                ? 'Update the details of your product' 
                : 'Fill in the details below to add a new product to your inventory'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error ? <div className="modal__error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="modal__body">
          <div className="form-group">
            <label className="form-label">
              Product Title <span className="required">*</span>
            </label>
            <input 
              className="form-input"
              value={form.title} 
              onChange={update("title")} 
              placeholder="Enter product name" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={update("description")}
              placeholder="Describe your product features and benefits"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Price <span className="required">*</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  className="form-input with-prefix"
                  value={form.price}
                  onChange={update("price")}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={form.category} 
                onChange={update("category")} 
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? "Loading..." : "Select category"}
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Delivery Time Estimate <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <input
                className="form-input"
                value={form.deliveryDays}
                onChange={update("deliveryDays")}
                type="number"
                min="1"
                step="1"
                placeholder="Enter estimated delivery days"
              />
              <span className="input-suffix">days</span>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isValid || submitting}>
              {submitting 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Product" : "Create Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
