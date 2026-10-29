import React from 'react';
import {
  Search,
  Shield,
  Star,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const Hero = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  onSearchSubmit
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-100/70 via-slate-50 to-white">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute -top-10 right-1/4 w-80 h-80 rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>SkillConnect Verified Marketplace</span>
          <span className="text-indigo-300">•</span>
          <span className="text-indigo-800 font-bold">Background Checked Specialists</span>
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          Hire Trusted Local Pros for Any Job{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
            Without the Hassle.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          From master electricians and emergency plumbers to carpenters and home cleaning — connect with verified experts on demand.
        </p>

        {/* Search Bar Container */}
        <div className="mt-10 max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="p-2 sm:p-3 bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch"
          >
            {/* Keyword Input */}
            <div className="flex-1 flex items-center px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="What service do you need? (e.g. electrical, leak, repair)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:w-60 flex items-center px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent border-none text-slate-700 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Find Experts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Real Dynamic Category Chips */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Explore:</span>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    onSearchSubmit();
                  }}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-white hover:bg-indigo-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Key Features Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Verified Pros</div>
              <div className="text-xs text-slate-500">Identity & license checked</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Quality Assured</div>
              <div className="text-xs text-slate-500">Real customer feedback</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Direct Scheduling</div>
              <div className="text-xs text-slate-500">Pick preferred time slot</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Clear Pricing</div>
              <div className="text-xs text-slate-500">Upfront job estimates</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
