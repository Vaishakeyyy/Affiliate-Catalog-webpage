import React, { useState, useEffect } from 'react';
import { Dress } from '../types';
import { ArrowLeft, ExternalLink, Globe, Tag, Heart, Award, ShieldCheck } from 'lucide-react';

interface ProductDetailProps {
  dress: Dress;
  allDresses: Dress[];
  onBack: () => void;
  onSelectDress: (dress: Dress) => void;
}

export default function ProductDetail({ dress, allDresses, onBack, onSelectDress }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState<string>(dress.images[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sync active image when dress changes
  useEffect(() => {
    if (dress.images && dress.images.length > 0) {
      setActiveImage(dress.images[0]);
    }
    // Pre-select first size and color if available
    if (dress.sizes && dress.sizes.length > 0) {
      setSelectedSize(dress.sizes[0]);
    }
    if (dress.colors && dress.colors.length > 0) {
      setSelectedColor(dress.colors[0]);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dress]);

  // Identify the affiliate store from the URL
  const getStoreName = (url: string): { name: string; color: string } => {
    try {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('amazon')) return { name: 'Amazon', color: 'bg-amber-50 text-amber-900 border-amber-100' };
      if (lowerUrl.includes('myntra')) return { name: 'Myntra', color: 'bg-pink-50 text-pink-900 border-pink-100' };
      if (lowerUrl.includes('ajio')) return { name: 'Ajio', color: 'bg-slate-50 text-slate-900 border-slate-100' };
      if (lowerUrl.includes('flipkart')) return { name: 'Flipkart', color: 'bg-blue-50 text-blue-900 border-blue-100' };
      if (lowerUrl.includes('meesho')) return { name: 'Meesho', color: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-100' };
      if (lowerUrl.includes('zara')) return { name: 'Zara', color: 'bg-stone-50 text-stone-900 border-stone-200' };
      if (lowerUrl.includes('hm.com') || lowerUrl.includes('h&m')) return { name: 'H&M', color: 'bg-red-50 text-red-900 border-red-100' };
      return { name: 'Official Store', color: 'bg-neutral-50 text-neutral-950 border-neutral-200' };
    } catch {
      return { name: 'Brand Website', color: 'bg-neutral-50 text-neutral-950 border-neutral-200' };
    }
  };

  const store = getStoreName(dress.purchaseLink);

  // Calculate related dresses: Same category or brand, excluding the current dress
  const relatedDresses = allDresses
    .filter((d) => d.id !== dress.id && (d.category === dress.category || d.brand === dress.brand))
    .slice(0, 4); // limit to 4 pieces

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBuyNow = () => {
    // Standard affiliate behavior - opens external url
    window.open(dress.purchaseLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="product-detail-view" className="min-h-screen bg-[#F9F9FB] pb-24 font-sans antialiased">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <button
            id="back-to-catalog-btn"
            onClick={onBack}
            className="group flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-neutral-700 transition-all duration-350 hover:border-black hover:text-black"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Back to Catalog
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Aggregator Collection
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs">
          
          {/* Left Column: Image Gallery (7-cols) */}
          <div className="space-y-4 lg:col-span-7">
            {/* Primary Display Image */}
            <div id="primary-product-image-container" className="relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100 border border-gray-100">
              <img
                src={activeImage}
                alt={dress.name}
                className="h-full w-full object-cover object-center transition-all duration-500 hover:scale-102"
              />
              {/* Overlay Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="rounded-full bg-black/80 px-3.5 py-1 text-[9px] font-bold tracking-widest text-white backdrop-blur-xs uppercase">
                  {dress.category}
                </span>
                <span className={`rounded-full border px-3.5 py-1 text-[9px] font-bold tracking-widest shadow-xs uppercase ${store.color}`}>
                  Featured on {store.name}
                </span>
              </div>
              
              {/* Floating Wishlist Heart */}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-md backdrop-blur-xs transition-transform duration-200 active:scale-95 hover:text-red-500"
              >
                <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "transition-colors"} />
              </button>
            </div>

            {/* Thumbnail Selection */}
            {dress.images && dress.images.length > 1 && (
              <div id="product-thumbnails" className="flex flex-wrap gap-3">
                {dress.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-3/4 w-20 overflow-hidden rounded-xl border bg-white transition-all duration-350 ${
                      activeImage === img ? 'border-black ring-2 ring-black/10' : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Specs and Buying Options (5-cols) */}
          <div className="space-y-8 lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Brand, Order Number and Share row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    {dress.brand}
                  </span>
                  <span className="h-3.5 w-[1px] bg-neutral-200" />
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-md font-medium tracking-wide">
                    Order Ref: #{dress.orderNumber}
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase text-neutral-600 transition-colors hover:border-black hover:text-black"
                >
                  {isCopied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-3xl font-light tracking-tight text-neutral-900 sm:text-4xl font-serif">
                  {dress.name}
                </h1>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-light text-neutral-950 font-mono">
                    {dress.currency}{dress.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-light">Includes all platform redirects</span>
                </div>
              </div>

              {/* Premium Highlights */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-[#F9F9FB] p-4 text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-neutral-400" />
                  <span>100% {dress.material}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-neutral-400" />
                  <span>Verified Affiliate</span>
                </div>
              </div>

              {/* Dress Description */}
              <div className="prose prose-sm text-neutral-600">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">The Design</h3>
                <p className="mt-2 leading-relaxed text-sm font-light text-neutral-600">{dress.description}</p>
              </div>

              {/* Colors Swatches */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Available Colors</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dress.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-350 ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        {isSelected && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes Selectors */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Available Sizes</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-black hover:underline cursor-pointer">Size Advisor</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dress.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-11 min-w-11 items-center justify-center rounded-xl border text-xs font-bold tracking-wider uppercase transition-all duration-350 ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CRITICAL: Prominent affiliate redirect buy button */}
            <div className="pt-6 border-t border-gray-150">
              <button
                id="buy-now-external-redirect-btn"
                onClick={handleBuyNow}
                className="group relative flex w-full items-center justify-center gap-2.5 rounded-full bg-black py-4.5 text-center text-xs font-bold tracking-widest uppercase text-white shadow-md transition-all duration-350 active:scale-98 hover:bg-neutral-800"
              >
                <Globe size={14} className="animate-spin-slow text-neutral-300 group-hover:text-white" />
                BUY ON {store.name.toUpperCase()}
                <ExternalLink size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </button>
              
              <p className="mt-3 text-center text-[10px] text-neutral-400 font-light leading-relaxed">
                Clicking redirects you to the official product page on <span className="font-semibold text-neutral-500">{store.name}</span>. No checkouts happen on this website.
              </p>
            </div>

          </div>
        </div>

        {/* Technical Specifications Accordion/Grid */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Product Specifications</h3>
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-b border-gray-100 pb-3">
              <dt className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Fabric Material</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-800">{dress.material}</dd>
            </div>
            {Object.entries(dress.specifications).map(([key, val]) => (
              <div key={key} className="border-b border-gray-100 pb-3">
                <dt className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{key}</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-800">{val}</dd>
              </div>
            ))}
          </dl>
          
          {/* Tags list */}
          {dress.tags && dress.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-gray-100">
              <Tag size={12} className="text-neutral-400" />
              {dress.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section: Related Dresses */}
        {relatedDresses.length > 0 && (
          <section id="related-dresses-section" className="mt-20 border-t border-gray-100 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-light tracking-tight text-neutral-900 font-serif">
                  Style Pairings & Related Pieces
                </h2>
                <p className="mt-1 text-xs text-neutral-400 font-light">
                  Explore other handpicked dresses curated from Zara, H&M, and other premier brands.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedDresses.map((item) => (
                <div
                  key={item.id}
                  id={`related-dress-card-${item.id}`}
                  onClick={() => onSelectDress(item)}
                  className="group cursor-pointer space-y-4 bg-white rounded-2xl p-3 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-350"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-neutral-100">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-103"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-black/85 px-3 py-1 text-[9px] font-bold tracking-widest text-white backdrop-blur-xs uppercase">
                        {item.brand}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-1">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                      {item.brand}
                    </span>
                    <h3 className="mt-1 truncate text-base font-medium text-neutral-900 group-hover:text-black font-serif transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-neutral-950 font-mono">
                      {item.currency}{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
