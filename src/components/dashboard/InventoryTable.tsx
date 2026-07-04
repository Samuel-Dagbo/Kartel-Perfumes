"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle, Upload, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  concentration: string;
  volume: number;
  gender: string;
  brand?: string;
  category?: string;
  isFeatured?: boolean;
  isActive: boolean;
  images?: string[];
}

interface InventoryTableProps {
  products: Product[];
  onRefresh: () => void;
}

export default function InventoryTable({ products, onRefresh }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    concentration: "",
    volume: "",
    gender: "unisex",
    brand: "",
    category: "",
    isFeatured: false,
    isActive: true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [addImageUrl, setAddImageUrl] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    concentration: "",
    volume: "",
    gender: "unisex",
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        setDeleteConfirm(null);
        onRefresh();
      } else {
        toast.error("Failed to delete product");
      }
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setAddImageUrl(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImagePreview(URL.createObjectURL(file));
    setEditUploading(true);
    try {
      const url = await uploadImage(file);
      setEditImageUrl(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setEditUploading(false);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditImageUrl("");
    setEditImagePreview(null);
    setEditForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      originalPrice: product.originalPrice != null && product.originalPrice !== undefined ? String(product.originalPrice) : "",
      stock: product.stock != null ? String(product.stock) : "",
      concentration: product.concentration ?? "",
      volume: product.volume != null ? String(product.volume) : "",
      gender: product.gender ?? "unisex",
      brand: product.brand ?? "",
      category: product.category ?? "",
      isFeatured: !!product.isFeatured,
      isActive: product.isActive,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      toast.error("Product name is required");
      return;
    }
    if (!editForm.concentration.trim()) {
      toast.error("Concentration is required");
      return;
    }
    if (!editForm.brand.trim()) {
      toast.error("Brand is required");
      return;
    }
    if (!editForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    const parsedPrice = parseFloat(editForm.price);
    const parsedStock = parseInt(editForm.stock, 10);
    const parsedVolume = parseInt(editForm.volume, 10);
    const parsedOriginalPrice = editForm.originalPrice.trim() === "" ? null : parseFloat(editForm.originalPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    if (Number.isNaN(parsedVolume) || parsedVolume < 1) {
      toast.error("Please enter a valid volume (ml)");
      return;
    }
    if (parsedOriginalPrice !== null && (Number.isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
      toast.error("Please enter a valid original price");
      return;
    }
    try {
      const body: Record<string, unknown> = {
        name: trimmedName,
        stock: parsedStock,
        price: parsedPrice,
        volume: parsedVolume,
        concentration: editForm.concentration.trim(),
        gender: editForm.gender,
        isFeatured: editForm.isFeatured,
        isActive: editForm.isActive,
      };
      const desc = editForm.description.trim();
      if (desc) body.description = desc;
      const brand = editForm.brand.trim();
      if (brand) body.brand = brand;
      const category = editForm.category.trim();
      if (category) body.category = category;
      if (parsedOriginalPrice !== null) {
        body.originalPrice = parsedOriginalPrice;
      } else {
        body.originalPrice = null;
      }
      if (editImageUrl) {
        body.images = [editImageUrl];
      }
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Product updated");
        setEditingProduct(null);
        setEditImageUrl("");
        setEditImagePreview(null);
        onRefresh();
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addImageUrl) {
      toast.error("Please upload a product image");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          volume: parseInt(formData.volume),
          images: [addImageUrl],
          scentNotes: { top: [], heart: [], base: [] },
          brand: "Kartel",
          category: formData.concentration,
        }),
      });
      if (res.ok) {
        toast.success("Product added");
        setShowAddModal(false);
        setAddImageUrl("");
        setAddImagePreview(null);
        setFormData({ name: "", description: "", price: "", stock: "", concentration: "", volume: "", gender: "unisex" });
        onRefresh();
      } else {
        toast.error("Failed to add product");
      }
    } catch {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-mist/50 rounded-xl text-sm placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all shadow-sm"
          />
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-mist/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist/40 bg-gradient-to-r from-mist/30 to-mist/10">
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Product</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden md:table-cell">Concentration</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Price</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Stock</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden sm:table-cell">Status</th>
                <th className="text-right py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-mist/20 hover:bg-mist/10 transition-colors duration-150"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-mist shrink-0 border border-mist/30 shadow-sm">
                          {product.images?.[0] ? (
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${product.images[0]})` }} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gold-dark/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-charcoal">{product.name}</span>
                          <span className="block text-xs text-charcoal/30 mt-0.5">{product.volume}ml</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-charcoal/60 hidden md:table-cell">
                      <Badge variant="default" size="sm">{product.concentration}</Badge>
                    </td>
                    <td className="py-4 px-5 font-medium">{formatPrice(product.price)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[60px] h-1.5 bg-mist/60 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${product.stock <= 5 ? "bg-rosegold" : product.stock <= 15 ? "bg-gold/50" : "bg-sage/50"}`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${product.stock <= 5 ? "text-rosegold" : "text-charcoal/60"}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && <AlertTriangle className="w-3 h-3 text-rosegold/60 shrink-0" />}
                        {product.stock === 0 && <span className="text-[9px] text-rosegold/70 bg-rosegold/10 px-1.5 py-0.5 rounded font-medium">OUT</span>}
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden sm:table-cell">
                      <Badge variant={product.isActive ? "success" : "danger"} size="sm">
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)}
                          className="p-2 hover:bg-mist/50 rounded-xl transition-colors duration-200" aria-label="Edit product">
                          <Edit2 className="w-4 h-4 text-charcoal/40 hover:text-gold-dark transition-colors" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product._id)}
                          className="p-2 hover:bg-rosegold/10 rounded-xl transition-colors duration-200" aria-label="Delete product">
                          <Trash2 className="w-4 h-4 text-rosegold/60 hover:text-rosegold transition-colors" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-charcoal/20" />
            </div>
            <p className="text-charcoal/40 text-sm">No products found</p>
            {search && <p className="text-xs text-charcoal/30 mt-1">Try a different search term</p>}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Product" size="sm">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 bg-rosegold/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-rosegold" />
          </div>
          <div>
            <p className="text-sm text-charcoal/60">Are you sure you want to delete this product?</p>
            <p className="text-xs text-charcoal/40 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm!)}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product" size="lg">
        <form onSubmit={handleEdit} className="space-y-5">
          <Input label="Product Name" value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            required maxLength={120} />

          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={5000}
              rows={3}
              className="w-full px-4 py-3.5 bg-white border border-mist rounded-xl text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all resize-y"
              placeholder="Product description"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">Product Image</label>
            <input type="file" ref={editFileRef} accept="image/*" onChange={handleEditFileChange} className="hidden" />
            {(editImagePreview || editingProduct?.images?.[0]) && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-mist/30 mb-3">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${editImagePreview || editingProduct?.images?.[0]})` }} />
                {editImagePreview && (
                  <button type="button" onClick={() => { setEditImagePreview(null); setEditImageUrl(""); }}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <button type="button" onClick={() => editFileRef.current?.click()} disabled={editUploading}
              className="flex items-center gap-2 px-4 py-2.5 border border-mist/50 rounded-xl text-xs text-charcoal/60 hover:border-gold/30 hover:text-gold-dark transition-all">
              <Upload className="w-4 h-4" />
              {editUploading ? "Uploading..." : editImageUrl ? "Change Image" : "Upload Image"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" min="0" value={editForm.price}
              onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} required />
            <Input label="Original Price (optional)" type="number" step="0.01" min="0" value={editForm.originalPrice}
              onChange={(e) => setEditForm((f) => ({ ...f, originalPrice: e.target.value }))}
              helper="Set to empty to clear sale price" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock" type="number" min="0" value={editForm.stock}
              onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))} required />
            <Input label="Volume (ml)" type="number" min="1" step="1" value={editForm.volume}
              onChange={(e) => setEditForm((f) => ({ ...f, volume: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Concentration" value={editForm.concentration}
              onChange={(e) => setEditForm((f) => ({ ...f, concentration: e.target.value }))} required maxLength={80} />
            <Input label="Brand" value={editForm.brand}
              onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))} required maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={editForm.category}
              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} required maxLength={120} />
            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">Gender</label>
              <select value={editForm.gender} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full px-4 py-3.5 bg-white border border-mist rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all">
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <label className="flex items-center justify-between px-4 py-3.5 border border-mist rounded-xl cursor-pointer hover:border-gold/30 transition-all">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60">Active</span>
              <input type="checkbox" checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-gold" />
            </label>
            <label className="flex items-center justify-between px-4 py-3.5 border border-mist rounded-xl cursor-pointer hover:border-gold/30 transition-all">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60">Featured</span>
              <input type="checkbox" checked={editForm.isFeatured}
                onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 accent-gold" />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="sm" loading={editUploading}>Save Changes</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Product">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">Product Image *</label>
            <input type="file" ref={addFileRef} accept="image/*" onChange={handleAddFileChange} className="hidden" />
            {addImagePreview && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-mist/30 mb-3">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${addImagePreview})` }} />
                {addImageUrl && (
                  <div className="absolute bottom-1 left-1 bg-sage/90 text-white text-[8px] px-2 py-0.5 rounded">Uploaded</div>
                )}
              </div>
            )}
            <button type="button" onClick={() => addFileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 border border-mist/50 rounded-xl text-xs text-charcoal/60 hover:border-gold/30 hover:text-gold-dark transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : addImageUrl ? "Change Image" : "Upload Image"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <Input label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Concentration" value={formData.concentration} onChange={(e) => setFormData({ ...formData, concentration: e.target.value })} required />
            <Input label="Volume (ml)" type="number" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">Gender</label>
            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3.5 bg-white border border-mist rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all">
              <option value="unisex">Unisex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="sm" loading={uploading} disabled={!addImageUrl}>Add Product</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
