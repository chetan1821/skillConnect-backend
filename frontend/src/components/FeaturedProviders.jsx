import React from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Briefcase,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const FeaturedProviders = ({
  providers,
  selectedCategory,
  searchQuery,
  onSelectProvider,
  onResetFilters
}) => {
  return (
    <section id="providers" className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Network
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Service Professionals
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Every provider has passed credential verification and maintains an average client satisfaction above 4.7 stars.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-sm font-semibold text-slate-500">
            Showing <span className="text-indigo-600 font-bold">{providers.length}</span> top rated specialists
          </div>
        </div>

        {/* Empty State */}
        {providers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No professionals found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find matches for {searchQuery ? `"${searchQuery}"` : ''} {selectedCategory ? `in ${selectedCategory}` : ''}. Try broadening your search.
            </p>
            <button
              onClick={onResetFilters}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Providers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {providers.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header & Avatar */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={pro.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.full_name)}&background=6366f1&color=fff`}
                          alt={pro.full_name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                        />
                        {pro.is_verified && (
                          <div
                            title="Identity & License Verified"
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-sm"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {pro.full_name}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600 truncate mt-0.5">
                          {pro.business_name}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                            <span>{pro.rating || '4.9'}</span>
                          </div>
                          <span>•</span>
                          <span>{pro.reviews_count || 120} reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {pro.description}
                    </p>

                    {/* Badges / Experience */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        {pro.experience_years} Years Exp.
                      </span>

                      {pro.city && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {pro.city}
                        </span>
                      )}

                      {pro.price_range && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          {pro.price_range}
                        </span>
                      )}
                    </div>

                    {/* Service Category Pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(pro.categories || ['General Service']).map((catName) => (
                        <span
                          key={catName}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold"
                        >
                          {catName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Response: <span className="text-emerald-600 font-bold">&lt; 20 min</span>
                  </div>

                  <button
                    onClick={() => onSelectProvider(pro)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <span>View & Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

