import React from 'react';
import {
  Search,
  Shield,
  Star,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Users
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
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 bg-gradient-to-b from-slate-100/90 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Background ambient decorative shapes with glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-indigo-400/25 dark:bg-indigo-600/20 blur-3xl" />
        <div className="absolute -top-10 right-1/4 w-80 h-80 rounded-full bg-violet-400/20 dark:bg-violet-600/15 blur-3xl" />
        <div className="absolute top-48 right-10 w-72 h-72 rounded-full bg-emerald-300/20 dark:bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & Search Engine */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Trust Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SkillConnect Verified Marketplace</span>
              <span className="text-indigo-300 dark:text-indigo-700">•</span>
              <span className="text-indigo-900 dark:text-indigo-200 font-bold">100% Escrow Protected</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Hire Trusted Local Pros for Any Job{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Without the Hassle.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              From master electricians and emergency plumbers to carpenter craft and deep cleaning — connect with vetted experts on demand with transparent visiting fees and 2-step OTP safety.
            </p>

            {/* Search Bar Container */}
            <div className="mt-8 max-w-2xl mx-auto lg:mx-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit();
                }}
                className="p-2 sm:p-2.5 bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 dark:shadow-indigo-950/40 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-stretch transition-colors"
              >
                {/* Keyword Input */}
                <div className="flex-1 flex items-center px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2.5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search trade (e.g. electrical, leak, ac repair)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="sm:w-52 flex items-center px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Trades</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Submit Button */}
                <button
                  type="submit"
                  className="px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 flex-shrink-0"
                >
                  <span>Find Pros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Dynamic Category Chips */}
              {categories.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Popular:</span>
                  {categories.slice(0, 5).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        onSearchSubmit();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                    >
                      {cat.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics Bar on Mobile & Desktop */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">30+</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Service Trades</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">4.9 ★</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Customer Rating</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">₹199</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Base Visiting Fee</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Image Showcase & Floating Cards */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none">
              
              {/* Main Professional Technician Showcase Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/15 border-2 border-white/60 dark:border-slate-800 bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
                  alt="SkillConnect Certified Service Specialist"
                  className="w-full h-[320px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Rajesh Sharma</p>
                      <p className="text-[10px] text-slate-300">Master Electrician • 8+ Yrs Exp</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                    Verified Pro
                  </span>
                </div>
              </div>

              {/* Floating Card 1: Customer Rating & Satisfaction (Top Left) */}
              <div className="absolute -top-4 -left-3 sm:-left-6 p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 animate-float flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">4.9 / 5.0</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">(1,250+ reviews)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Top Rated Service</p>
                </div>
              </div>

              {/* Floating Card 2: 2-Stage OTP Protection (Bottom Right) */}
              <div className="hidden sm:flex absolute -bottom-5 -right-3 sm:-right-5 p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 animate-float-slow items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">2-Stage Security OTP</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Funds released on completion</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
