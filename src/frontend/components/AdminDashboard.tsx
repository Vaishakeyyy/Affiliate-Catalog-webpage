import React, { useState, useMemo, useRef } from 'react';
import { Dress } from '../types';
import { addDress, updateDress, deleteDress, setAdminAuthenticated } from '../data/db';
import { 
  Plus, Trash2, Edit, X, Image, Link, Tag, Mail, Lock, LogOut, 
  BarChart2, DollarSign, Bookmark, Layers, PlusCircle, AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  dresses: Dress[];
  onRefreshDresses: () => void;
  onLogout: () => void;
  userEmail: string;
}

const DEFAULT_FORM_STATE = {
  orderNumber: '' as string | number,
  name: '',
  brand: '',
  category: '',
  description: '',
  price: 0,
  currency: '₹',
  images: [] as string[],
  sizes: [] as string[],
  colors: [] as string[],
  material: '',
  specifications: {} as Record<string, string>,
  tags: [] as string[],
  purchaseLink: ''
};

export default function AdminDashboard({ dresses, onRefreshDresses, onLogout, userEmail }: AdminDashboardProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fashion_catalog_admin_session') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // CRUD Panel States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDressId, setEditingDressId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  
  // Custom Spec additions helpers
  const [customSpecKey, setCustomSpecKey] = useState('');
  const [customSpecVal, setCustomSpecVal] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Image File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick stats
  const stats = useMemo(() => {
    const total = dresses.length;
    const avgPrice = total > 0 ? Math.round(dresses.reduce((acc, curr) => acc + curr.price, 0) / total) : 0;
    const uniqueBrands = new Set(dresses.map(d => d.brand)).size;
    const uniqueCategories = new Set(dresses.map(d => d.category)).size;
    return { total, avgPrice, uniqueBrands, uniqueCategories };
  }, [dresses]);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Both email and password are required.');
      return;
    }

    // Authenticate: Exclusive administrator ID
    if (
      loginEmail.toLowerCase() === 'vaishakh884@gmail.com' && 
      loginPassword === 'admin123'
    ) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid credentials. Access restricted to the designated administrator ID.');
    }
  };

  const handleLogoutClick = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    onLogout();
  };

  // Open Form for Adding new dress
  const handleOpenAddForm = () => {
    setEditingDressId(null);
    setFormData({
      ...DEFAULT_FORM_STATE,
      orderNumber: Math.floor(1001 + Math.random() * 8999), // Random 4-digit integer
      price: 1500, // Reasonable starting default
      currency: '₹'
    });
    setCustomSpecKey('');
    setCustomSpecVal('');
    setColorInput('');
    setTagInput('');
    setImageUrlInput('');
    setIsFormOpen(true);
  };

  // Open Form for Editing an existing dress
  const handleOpenEditForm = (dress: Dress) => {
    setEditingDressId(dress.id);
    setFormData({
      orderNumber: dress.orderNumber || Math.floor(1001 + Math.random() * 8999),
      name: dress.name,
      brand: dress.brand,
      category: dress.category,
      description: dress.description,
      price: dress.price,
      currency: dress.currency,
      images: [...dress.images],
      sizes: [...dress.sizes],
      colors: [...dress.colors],
      material: dress.material,
      specifications: { ...dress.specifications },
      tags: [...dress.tags],
      purchaseLink: dress.purchaseLink
    });
    setCustomSpecKey('');
    setCustomSpecVal('');
    setColorInput('');
    setTagInput('');
    setImageUrlInput('');
    setIsFormOpen(true);
  };

  // Handle deletion
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the listing for "${name}"? This cannot be undone.`)) {
      await deleteDress(id);
      onRefreshDresses();
    }
  };

  // Size chips toggling
  const toggleSizeSelection = (size: string) => {
    setFormData(prev => {
      const isSelected = prev.sizes.includes(size);
      const updated = isSelected 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  };

  // Handle color chips addition
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    const cleanColor = colorInput.trim();
    if (!formData.colors.includes(cleanColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, cleanColor]
      }));
    }
    setColorInput('');
  };

  const handleRemoveColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  // Handle tag chips addition
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase();
    if (!formData.tags.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, cleanTag]
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle Specification row additions
  const handleAddSpecification = () => {
    if (!customSpecKey.trim() || !customSpecVal.trim()) return;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [customSpecKey.trim()]: customSpecVal.trim()
      }
    }));
    setCustomSpecKey('');
    setCustomSpecVal('');
  };

  const handleRemoveSpecification = (key: string) => {
    setFormData(prev => {
      const updatedSpecs = { ...prev.specifications };
      delete updatedSpecs[key];
      return { ...prev, specifications: updatedSpecs };
    });
  };

  // Handle adding image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  // Handle deleting individual image thumbnail
  const handleRemoveImageIndex = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  // Genuine Local File upload converting to Base64
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each selected file
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save/Submit CRUD form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const orderNumberStr = String(formData.orderNumber).trim();
    if (!orderNumberStr) return alert('Order number / SKU Code is required');
    const orderNumberInt = parseInt(orderNumberStr, 10);
    if (isNaN(orderNumberInt)) return alert('Order number must be a valid integer');

    if (!formData.name.trim()) return alert('Dress name is required');
    if (!formData.brand.trim()) return alert('Brand is required');
    if (!formData.category.trim()) return alert('Category is required');
    if (formData.price <= 0) return alert('Price must be greater than zero');
    if (!formData.purchaseLink.trim()) return alert('External purchase link is required');
    if (formData.images.length === 0) {
      return alert('At least one product image is required (URL or file upload)');
    }

    const finalPayload = {
      ...formData,
      orderNumber: orderNumberInt
    };

    try {
      if (editingDressId) {
        await updateDress(editingDressId, finalPayload);
      } else {
        await addDress(finalPayload);
      }
      onRefreshDresses();
      setIsFormOpen(false);
      setEditingDressId(null);
    } catch (err: any) {
      alert(`Error saving dress: ${err.message}`);
    }
  };

  // Filter listings by search
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return dresses;
    const term = searchQuery.toLowerCase().trim();
    return dresses.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.brand.toLowerCase().includes(term) ||
        d.category.toLowerCase().includes(term) ||
        String(d.orderNumber).includes(term) ||
        `#${d.orderNumber}`.toLowerCase().includes(term)
    );
  }, [dresses, searchQuery]);

  // LOGIN SCREEN RENDER
  if (!isAuthenticated) {
    return (
      <div id="admin-login-view" className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl border border-neutral-100">
          
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white shadow-lg shadow-black/10">
              <Lock size={20} className="stroke-[1.5]" />
            </span>
            <h2 className="mt-6 text-3xl font-serif text-neutral-900 tracking-tight">
              Portal Authentication
            </h2>
            <p className="mt-2 text-xs text-neutral-500 font-light max-w-[280px] mx-auto leading-relaxed">
              Verify credentials to access administrative controls, edit listings, and maintain outbound purchase endpoints.
            </p>
          </div>

          {loginError && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span className="font-medium">{loginError}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Mail size={15} />
                </span>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-3 pr-4 pl-10 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Lock size={15} />
                </span>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-3 pr-4 pl-10 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>

            <button
              id="admin-submit-login-btn"
              type="submit"
              className="w-full rounded-xl bg-neutral-950 py-3 text-center text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/10 cursor-pointer"
            >
              Sign In Securely
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onLogout}
              className="text-xs font-medium text-neutral-400 hover:text-neutral-950 transition-colors"
            >
              ← Back to Customer Catalog
            </button>
          </div>

        </div>
      </div>
    );
  }

  // CORE DASHBOARD PANEL RENDER
  return (
    <div id="admin-dashboard-view" className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-neutral-950 p-2 text-white shadow-xs">
              <BarChart2 size={16} className="stroke-[1.5]" />
            </span>
            <div>
              <h1 className="text-xs font-bold tracking-widest uppercase text-neutral-950">
                Studio Catalog Manager
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">Session ID: {loginEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-all hover:border-neutral-950 hover:text-neutral-950 cursor-pointer"
            >
              <LogOut size={13} />
              Exit Portal
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        
        {/* Real-time KPI Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <Layers size={13} className="text-neutral-400 stroke-[1.5]" />
              Total Outfits
            </div>
            <p className="mt-3 text-3xl font-light text-neutral-950 font-mono tracking-tight">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <DollarSign size={13} className="text-neutral-400 stroke-[1.5]" />
              Avg Est Price
            </div>
            <p className="mt-3 text-3xl font-light text-neutral-950 font-mono tracking-tight font-bold">₹{stats.avgPrice.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <Bookmark size={13} className="text-neutral-400 stroke-[1.5]" />
              Brands Active
            </div>
            <p className="mt-3 text-3xl font-light text-neutral-950 font-mono tracking-tight">{stats.uniqueBrands}</p>
          </div>

          <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <PlusCircle size={13} className="text-neutral-400 stroke-[1.5]" />
              Categories
            </div>
            <p className="mt-3 text-3xl font-light text-neutral-950 font-mono tracking-tight">{stats.uniqueCategories}</p>
          </div>
        </div>

        {/* Action controls row: Add Dress button & directory search */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-t border-neutral-200/50 pt-10">
          <div>
            <h2 className="text-2xl font-serif text-neutral-950 tracking-tight">Active Dress Directory</h2>
            <p className="text-xs text-neutral-500 font-light mt-1">Manage specifications, color tags, and external redirection routes for active outfits.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <button
              id="admin-add-new-dress-btn"
              onClick={handleOpenAddForm}
              className="flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-xs hover:bg-neutral-900 hover:shadow-md transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              Add Dress Listing
            </button>
          </div>
        </div>

        {/* Directory Listing List View */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-2xs">
          {filteredListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                <thead className="bg-neutral-50/75 text-neutral-400 uppercase font-bold tracking-widest text-[9px] border-b border-neutral-200">
                  <tr>
                    <th scope="col" className="px-6 py-4">Product Outline</th>
                    <th scope="col" className="px-6 py-4">Brand</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Estimated Price</th>
                    <th scope="col" className="px-6 py-4">Sourcing Link</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium">
                  {filteredListings.map((dress) => (
                    <tr key={dress.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 flex items-center gap-4">
                        <img
                          src={dress.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'}
                          alt={dress.name}
                          className="h-14 w-10 rounded-lg object-cover bg-neutral-100 border border-neutral-100"
                        />
                        <div>
                          <p className="font-serif text-sm text-neutral-900">{dress.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-neutral-400 font-light">Material: {dress.material}</span>
                            <span className="h-2 w-[1px] bg-neutral-200" />
                            <span className="text-[9px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-bold">#{dress.orderNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[9px] font-bold text-neutral-800 uppercase tracking-widest">
                          {dress.brand}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-neutral-500 font-light">{dress.category}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-neutral-950 font-mono">
                        {dress.currency}{dress.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 max-w-xs truncate text-[11px]">
                        <a 
                          href={dress.purchaseLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:underline flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 font-semibold transition-colors"
                        >
                          <Link size={11} className="text-neutral-400 stroke-[1.5]" />
                          {dress.purchaseLink.split('/')[2] || 'Store link'}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right space-x-2">
                        <button
                          id={`edit-dress-btn-${dress.id}`}
                          onClick={() => handleOpenEditForm(dress)}
                          className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 transition-colors cursor-pointer"
                        >
                          <Edit size={12} className="stroke-[1.5]" />
                          Edit
                        </button>
                        <button
                          id={`delete-dress-btn-${dress.id}`}
                          onClick={() => handleDelete(dress.id, dress.name)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-100 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} className="stroke-[1.5]" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-neutral-400">
              <X size={20} className="mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
              <p className="font-light text-sm">No dress listings match your current search.</p>
            </div>
          )}
        </div>

        {/* MODAL FORM PANEL */}
        {isFormOpen && (
          <div id="admin-dress-form-modal" className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity p-4">
            <div className="flex h-full w-full max-w-2xl flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100">
              
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-neutral-150 px-6 py-5 bg-neutral-50/50">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-neutral-950 font-sans">
                    {editingDressId ? 'Modify Dress Catalog Listing' : 'Introduce New Dress to Catalog'}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-light mt-0.5">Configure specifications, color tags, and external redirection links.</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <X size={14} className="stroke-[2]" />
                </button>
              </div>

              {/* Modal Form scroll container */}
              <form className="flex-1 overflow-y-auto p-6 space-y-8 text-xs text-neutral-700 font-medium" onSubmit={handleFormSubmit}>
                
                {/* Section 1: Basic Identifiers */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 font-sans">
                    1. Basic General Attributes
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Order Number / SKU *</label>
                      <input
                        id="form-dress-order-number"
                        type="text"
                        required
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g., 1001"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Dress Name *</label>
                      <input
                        id="form-dress-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Ethereal Silk Wrap Gown"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Brand/Designer *</label>
                      <input
                        id="form-dress-brand"
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g., Zara, Label Ritu Kumar"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Category *</label>
                      <select
                        id="form-dress-category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                      >
                        <option value="">Choose category</option>
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                        <option value="Ethnic">Ethnic</option>
                        <option value="Partywear">Partywear</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Estimated Price *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-mono">₹</span>
                        <input
                          id="form-dress-price"
                          type="number"
                          required
                          min="1"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                          placeholder="3499"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 py-2.5 pr-2.5 pl-7 text-xs text-neutral-900 font-mono placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Fabric Material *</label>
                      <input
                        id="form-dress-material"
                        type="text"
                        required
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="e.g., 100% Cotton, Georgette"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Brief Product Story/Description *</label>
                    <textarea
                      id="form-dress-description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write description detailing the look..."
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200 font-light"
                    />
                  </div>
                </div>

                {/* Section 2: Image Gallery Manager */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 font-sans">
                    2. Outfits Photo Assets (One or More) *
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Add Image from Web URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="Paste Unsplash or direct image URL..."
                          className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Upload Local Photo File</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          multiple
                          onChange={handleLocalImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl border border-dashed border-neutral-200 bg-neutral-50/10 py-2.5 text-center text-xs hover:border-neutral-950 text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer"
                        >
                          📁 Drag or Select Image File(s)
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.images.length > 0 ? (
                    <div>
                      <span className="block mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Currently Selected Assets ({formData.images.length})</span>
                      <div className="grid grid-cols-4 gap-3">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative aspect-3/4 rounded-xl overflow-hidden border border-neutral-200 group">
                            <img src={img} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImageIndex(index)}
                              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950/80 hover:bg-red-600 text-white text-[10px] shadow-xs hover:shadow-md transition-all cursor-pointer"
                              title="Delete Photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-neutral-50/50 border border-neutral-200 p-6 text-center text-neutral-400">
                      <Image size={20} className="mx-auto text-neutral-300 mb-1.5 stroke-[1.5]" />
                      <p className="font-light">Add at least one image via URL or upload to activate listing.</p>
                    </div>
                  )}
                </div>

                {/* Section 3: Sizes and Colors */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 font-sans">
                    3. Aesthetic Fitting Attributes (Sizes & Colors)
                  </h4>

                  <div>
                    <label className="block mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Toggle Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                        const isSelected = formData.sizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSizeSelection(size)}
                            className={`flex h-10 w-12 items-center justify-center rounded-xl border text-xs font-bold tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Available Colors</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                          placeholder="Type color & click enter..."
                          className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="rounded-xl bg-neutral-100 border border-neutral-200 px-4 text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.colors.map(color => (
                            <span key={color} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1 text-neutral-800 text-[11px]">
                              {color}
                              <button type="button" onClick={() => handleRemoveColor(color)} className="text-neutral-400 hover:text-red-500 font-bold transition-colors cursor-pointer">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Catalog Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                          placeholder="Type tag & press enter..."
                          className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/30 p-2.5 text-xs text-neutral-900 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="rounded-xl bg-neutral-100 border border-neutral-200 px-4 text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {formData.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 px-2.5 py-0.5 uppercase tracking-wider text-[9px] font-bold">
                              #{tag}
                              <button type="button" onClick={() => handleRemoveTag(tag)} className="text-neutral-400 hover:text-red-500 font-bold transition-colors cursor-pointer ml-1">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: Specifications */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 font-sans">
                    4. Technical Product Specifications (Dynamic Key-Value Rows)
                  </h4>

                  <div className="flex gap-3 items-end bg-neutral-50/50 rounded-xl border border-neutral-200 p-3">
                    <div className="flex-1">
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Property Key</label>
                      <input
                        type="text"
                        value={customSpecKey}
                        onChange={(e) => setCustomSpecKey(e.target.value)}
                        placeholder="e.g., Sleeve Type, Pattern"
                        className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Property Value</label>
                      <input
                        type="text"
                        value={customSpecVal}
                        onChange={(e) => setCustomSpecVal(e.target.value)}
                        placeholder="e.g., Balloon Sleeve"
                        className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
                    >
                      Add Spec
                    </button>
                  </div>

                  {Object.keys(formData.specifications).length > 0 && (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                        <thead className="bg-neutral-50/50 text-neutral-400 uppercase font-bold tracking-widest text-[9px] border-b">
                          <tr>
                            <th className="px-4 py-3">Technical Property Name</th>
                            <th className="px-4 py-3">Configured Value</th>
                            <th className="px-4 py-3 text-right">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {Object.entries(formData.specifications).map(([k, v]) => (
                            <tr key={k} className="hover:bg-neutral-50/30">
                              <td className="px-4 py-2.5 font-bold text-neutral-800">{k}</td>
                              <td className="px-4 py-2.5 text-neutral-500 font-light">{v}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpecification(k)}
                                  className="text-red-500 hover:text-red-700 font-semibold cursor-pointer text-[11px]"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 5: Affiliate Redirection Link */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5 font-sans">
                    5. Affiliate Redirection Links *
                  </h4>

                  <div>
                    <label className="block mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">External Purchase Landing Page URL *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                        <Link size={14} className="stroke-[1.5]" />
                      </span>
                      <input
                        id="form-dress-purchase-link"
                        type="url"
                        required
                        value={formData.purchaseLink}
                        onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
                        placeholder="https://www.amazon.in/dp/example-product-id"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 py-3 pr-4 pl-10 text-xs text-neutral-900 focus:bg-white focus:border-neutral-950 focus:outline-hidden transition-all duration-200 font-mono"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-neutral-400 leading-relaxed font-light">
                      Enter the outbound URL linking directly to Amazon, Myntra, Ajio, Flipkart, Meesho, or official boutique stores. This URL is tied to the customer's "Buy Now" CTA.
                    </p>
                  </div>
                </div>

                {/* Submit actions bottom row */}
                <div className="flex gap-4 pt-6 border-t border-neutral-150">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 rounded-xl border border-neutral-200 py-3 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    id="admin-save-dress-btn"
                    type="submit"
                    className="flex-1 rounded-xl bg-neutral-950 py-3 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/10 transition-all cursor-pointer"
                  >
                    Save Catalog Listing
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
