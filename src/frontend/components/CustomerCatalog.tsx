import React, { useState, useMemo } from 'react';
import { Dress, CatalogFilters } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, Check, RefreshCw, Layers, Sparkles, LogIn } from 'lucide-react';

interface CustomerCatalogProps {
  dresses: Dress[];
  onSelectDress: (dress: Dress) => void;
  onNavigateToAdmin: () => void;
}

const INITIAL_FILTERS: CatalogFilters = {
  search: '',
  brand: '',
  category: '',
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 10000,
  sortBy: 'latest'
};

export default function CustomerCatalog({ dresses, onSelectDress, onNavigateToAdmin }: CustomerCatalogProps) {
  const [filters, setFilters] = useState<CatalogFilters>(INITIAL_FILTERS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamically compute the filter boundaries and options from the actual data!
  const filterOptions = useMemo(() => {
    const brands = Array.from(new Set(dresses.map((d) => d.brand))).filter(Boolean).sort();
    const categories = Array.from(new Set(dresses.map((d) => d.category))).filter(Boolean).sort();
    const sizes = Array.from(new Set(dresses.flatMap((d) => d.sizes))).filter(Boolean).sort();
    const colors = Array.from(new Set(dresses.flatMap((d) => d.colors))).filter(Boolean).sort();
    const prices = dresses.map((d) => d.price);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

    return { brands, categories, sizes, colors, maxPrice };
  }, [dresses]);

  // Handle multi-select size filter toggles
  const handleSizeToggle = (size: string) => {
    setFilters((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  // Handle multi-select color filter toggles
  const handleColorToggle = (color: string) => {
    setFilters((prev) => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors };
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      ...INITIAL_FILTERS,
      maxPrice: filterOptions.maxPrice
    });
  };

  // Filter & Sort Dresses
  const filteredDresses = useMemo(() => {
    let result = [...dresses];

    // Search term matching (Dress Name, Brand, or Integer Order Code)
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.brand.toLowerCase().includes(term) ||
          String(d.orderNumber).includes(term) ||
          `#${d.orderNumber}`.toLowerCase().includes(term)
      );
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter((d) => d.brand === filters.brand);
    }

    // Category filter
    if (filters.category) {
      result = result.filter((d) => d.category === filters.category);
    }

    // Sizes multi-select filter (checks if at least one selected size is available on the dress)
    if (filters.sizes.length > 0) {
      result = result.filter((d) => d.sizes.some((s) => filters.sizes.includes(s)));
    }

    // Colors multi-select filter
    if (filters.colors.length > 0) {
      result = result.filter((d) => d.colors.some((c) => filters.colors.includes(c)));
    }

    // Price range filters
    result = result.filter((d) => d.price >= filters.minPrice && d.price <= filters.maxPrice);

    // Sorting
    if (filters.sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [dresses, filters]);

  return (
    <div id="customer-catalog-view" className="min-h-screen bg-[#F9F9FB] text-neutral-900 font-sans antialiased">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="h-5 w-[2px] bg-black" />
            <h1 className="text-lg tracking-wider font-light text-neutral-900">
              <span className="font-serif italic font-normal text-xl lowercase">vogue</span>
              <span className="font-bold uppercase tracking-widest text-[11px] ml-1.5 text-neutral-500">catalog</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              id="navigate-to-admin-btn"
              onClick={onNavigateToAdmin}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-neutral-700 transition-all duration-350 hover:border-black hover:bg-black hover:text-white cursor-pointer"
            >
              <LogIn size={12} />
              Admin Portal
            </button>
          </div>
        </div>
      </header>

      {/* 2. Editorial Vibe Hero Banner */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-24">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&auto=format&fit=crop&q=80"
            alt="Fashion Cover"
            className="h-full w-full object-cover object-center filter grayscale contrast-125 brightness-75"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/70 to-neutral-950" />
        <div className="relative mx-auto max-w-7xl px-6 text-center sm:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-neutral-300 backdrop-blur-md">
            <Sparkles size={10} className="text-amber-400" />
            Curated Autumn-Winter Collection
          </div>
          <h2 className="mt-6 text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl font-serif">
            The Art of <span className="italic">Elegance</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-neutral-400">
            A premium aggregated directory of boutique and designer dresses. Explore curated silhouettes and connect directly to trusted shopping channels.
          </p>
          <div className="mt-8 text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
            Featuring items from <span className="text-neutral-400">Zara</span> • <span className="text-neutral-400">H&M</span> • <span className="text-neutral-400">Myntra</span> • <span className="text-neutral-400">Ajio</span> • <span className="text-neutral-400">Mango</span>
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Interface */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        
        {/* Dynamic Search & Top Filters Bar */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-gray-100">
          
          {/* Combined Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={15} className="text-neutral-400" />
            </div>
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search dress, brand, designer..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-full border border-neutral-200 bg-white py-3 pr-4 pl-10 text-xs placeholder-neutral-400 transition-colors focus:border-black focus:ring-1 focus:ring-black focus:outline-hidden"
            />
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-350 ${
                !filters.category
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-black hover:text-black'
              }`}
            >
              All Outfits
            </button>
            {filterOptions.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-350 ${
                  filters.category === cat
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Layout grid: Left Filters Sidebar (Desktop) & Right Dress Grid */}
        <div className="mt-10 lg:grid lg:grid-cols-4 lg:gap-x-10">
          
          {/* FILTER PANEL: LEFT SIDEBAR (Hidden on mobile, layout is desktop-first side column) */}
          <div className="hidden lg:block space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Aesthetic Filters
              </h3>
              {(filters.brand || filters.sizes.length > 0 || filters.colors.length > 0 || filters.category || filters.search) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-black transition-colors"
                >
                  <RefreshCw size={10} />
                  Reset
                </button>
              )}
            </div>

            {/* Brand Selection */}
            <div className="border-t border-gray-100 pt-6">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                Brand / Designer
              </label>
              <select
                id="brand-filter-select"
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-700 transition-colors focus:border-black focus:ring-1 focus:ring-black focus:outline-hidden"
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Cap Sliders */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Max Price Limit
                </label>
                <span className="text-xs font-semibold text-neutral-900 font-mono">
                  ₹{filters.maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min="0"
                max={filterOptions.maxPrice || 10000}
                step="250"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                className="h-1 w-full cursor-pointer rounded-lg bg-neutral-200 accent-neutral-900"
              />
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 font-mono">
                <span>₹0</span>
                <span>₹{(filterOptions.maxPrice || 10000).toLocaleString()}</span>
              </div>
            </div>

            {/* Sizes Multi-select */}
            <div className="border-t border-gray-100 pt-6">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                Sizes Available
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.sizes.map((size) => {
                  const isActive = filters.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${
                        isActive
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors Multi-select */}
            <div className="border-t border-gray-100 pt-6">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.colors.map((color) => {
                  const isActive = filters.colors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-medium transition-all ${
                        isActive
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black'
                      }`}
                    >
                      {isActive && <Check size={10} className="text-white" />}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-xs leading-relaxed text-neutral-500 shadow-xs">
              <Layers size={14} className="text-neutral-400 mb-2" />
              This catalog acts as a fashion discovery aggregator. All checkout details and orders are directed to brand websites.
            </div>
          </div>

          {/* DRESS LISTINGS GRID (3/4 Width on Desktop, Full Width on Mobile) */}
          <div className="lg:col-span-3">
            
            {/* Filter Indicators and Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs text-neutral-500">
              <div className="font-light">
                Showing <span className="font-semibold text-neutral-900">{filteredDresses.length}</span> pieces
                {filters.category && <span> in <span className="font-semibold text-neutral-900">{filters.category}</span></span>}
                {filters.brand && <span> from <span className="font-semibold text-neutral-900">{filters.brand}</span></span>}
              </div>

              {/* Sorting selectors */}
              <div className="flex items-center gap-3">
                <ArrowUpDown size={12} className="text-neutral-400" />
                <span className="font-medium text-neutral-500 text-xs">Sort by:</span>
                <select
                  id="catalog-sort-select"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="rounded-md border border-neutral-200 bg-white py-1.5 px-2.5 text-xs text-neutral-700 focus:outline-hidden hover:border-neutral-300"
                >
                  <option value="latest">Newly Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Design: A to Z</option>
                </select>

                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 font-semibold hover:border-black text-[11px]"
                >
                  <SlidersHorizontal size={12} />
                  Filters
                </button>
              </div>
            </div>

            {/* MOBILE FILTER OVERLAY DRAWERS (Collapsible Drawer style) */}
            {isMobileFilterOpen && (
              <div id="mobile-filter-drawer" className="lg:hidden fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs transition-opacity">
                <div className="w-80 max-w-sm bg-white p-6 shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                      Catalog Filters
                    </h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Mobile Brand selection */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Brand</label>
                      <select
                        value={filters.brand}
                        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-xs"
                      >
                        <option value="">All Brands</option>
                        {filterOptions.brands.map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile Price Cap */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Max Price</label>
                        <span className="text-xs font-bold text-neutral-700 font-mono">₹{filters.maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={filterOptions.maxPrice || 10000}
                        step="250"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Mobile Sizes */}
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeToggle(size)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold ${
                              filters.sizes.includes(size) ? 'bg-black border-black text-white' : 'bg-white text-neutral-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Colors */}
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Colors</label>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorToggle(color)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                              filters.colors.includes(color) ? 'bg-black border-black text-white' : 'bg-white text-neutral-600'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={handleResetFilters}
                        className="flex-1 rounded-full border border-neutral-200 py-3 text-[11px] font-bold tracking-wider uppercase text-center hover:bg-neutral-50"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="flex-1 rounded-full bg-black py-3 text-[11px] font-bold tracking-wider uppercase text-white text-center hover:bg-neutral-800"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)} />
              </div>
            )}

            {/* DRESS GRID ITEMS */}
            {filteredDresses.length > 0 ? (
              <div id="catalog-dress-grid" className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDresses.map((dress) => {
                  const hasMultipleImages = dress.images && dress.images.length > 1;
                  return (
                    <div
                      key={dress.id}
                      id={`dress-card-${dress.id}`}
                      onClick={() => onSelectDress(dress)}
                      className="group relative cursor-pointer flex flex-col justify-between bg-white rounded-2xl p-3 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-350"
                    >
                      {/* Product Card Container */}
                      <div className="space-y-4">
                        
                        {/* Elegant Card Image */}
                        <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-neutral-100">
                          <img
                            src={dress.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'}
                            alt={dress.name}
                            className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-103"
                          />

                          {/* Top Badges overlay */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className="rounded-full bg-black/80 px-3 py-1 text-[9px] font-bold tracking-widest text-white backdrop-blur-xs uppercase">
                              {dress.brand}
                            </span>
                            {hasMultipleImages && (
                              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[8px] font-bold text-neutral-600 shadow-xs tracking-wider uppercase">
                                +{dress.images.length - 1} view{dress.images.length > 2 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Order Number tag overlay top-right */}
                          <div className="absolute top-3 right-3">
                            <span className="rounded-full bg-neutral-950/40 text-[9px] font-mono text-white px-2.5 py-0.5 tracking-wider font-semibold backdrop-blur-xs">
                              #{dress.orderNumber}
                            </span>
                          </div>

                          {/* Fabric Details Badge on Hover */}
                          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-transform duration-350 group-hover:translate-y-0">
                            <div className="text-[10px] font-bold tracking-wider text-neutral-300 uppercase">Fabric Composition</div>
                            <div className="text-xs font-semibold text-white mt-1 font-serif italic">{dress.material}</div>
                          </div>
                        </div>

                        {/* Text descriptions */}
                        <div className="px-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                              {dress.category}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400">
                              Ref: #{dress.orderNumber}
                            </span>
                          </div>
                          <h4 className="mt-1.5 truncate text-base font-medium text-neutral-900 group-hover:text-black font-serif transition-colors">
                            {dress.name}
                          </h4>
                          
                          {/* Sizes Available display indicator */}
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Sizes:</span>
                            <div className="flex gap-1 flex-wrap">
                              {dress.sizes.map((s) => (
                                <span key={s} className="text-[9px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Pricing and quick CTA link */}
                      <div className="mt-4 px-1 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-sm font-semibold text-neutral-900 font-mono">
                          {dress.currency}{dress.price.toLocaleString()}
                        </span>
                        
                        <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 group-hover:text-black group-hover:underline flex items-center gap-1 transition-all">
                          View Details →
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty Search and Filter states
              <div id="catalog-empty-state" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white p-16 text-center shadow-xs">
                <Layers size={32} className="text-neutral-300 mb-4 animate-pulse" />
                <h3 className="text-base font-semibold text-neutral-800">No dresses matched your aesthetic</h3>
                <p className="mt-2 text-xs text-neutral-400 max-w-sm font-light leading-relaxed">
                  We couldn't find any pieces matching your current combined filters. Try adjusting your brand preferences or relaxing the price limits.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 rounded-full bg-black px-6 py-2.5 text-xs font-bold tracking-wider uppercase text-white shadow-md hover:bg-neutral-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
