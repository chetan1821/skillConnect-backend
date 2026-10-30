import React from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';

export const FeaturedProviders = ({
  providers = [],
  selectedCategory,
  searchQuery,
  onSelectProvider,
  onResetFilters
}) => {
  return (
    <section id="providers" className="py-14 sm:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Network</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verified Service Professionals
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Browse background-checked specialists registered and active on the SkillConnect platform.
            </p>
          </div>

          <div className="mt-3 md:mt-0 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{providers.length}</span> specialists
          </div>
        </div>

        {/* Empty State */}
        {providers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No professionals found</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {searchQuery || selectedCategory
                ? `We couldn't find specialists matching "${searchQuery || selectedCategory}". Try clearing your filters.`
                : 'No providers have registered in this trade yet.'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={onResetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          /* Responsive Providers Grid (1 column on mobile, 2 on tablet, 3 on desktop) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {providers.map((pro) => (
              <div
                key={pro.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6 pb-4">
                  
                  {/* Card Header & Avatar */}
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-lg sm:text-xl ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm">
                        {pro.full_name ? pro.full_name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      {pro.is_verified && (
                        <div
                          title="Verified Professional"
                          className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {pro.business_name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Specialist: {pro.full_name}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          <span>{pro.rating || '4.9'}</span>
                        </div>
                        <span className="text-slate-400 dark:text-slate-500">
                          ({pro.reviews_count || 120}+ jobs)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio Snippet */}
                  {pro.description && (
                    <p className="mt-3.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {pro.description}
                    </p>
                  )}

                  {/* Experience & Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {pro.experience_years !== undefined && pro.experience_years !== null && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{pro.experience_years} Yrs Exp</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-100 dark:border-indigo-900/60">
                      <Zap className="w-3 h-3 text-indigo-500" />
                      <span>Visiting: ₹{pro.visiting_fee || '199'}</span>
                    </span>

                    {pro.hourly_rate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>₹{pro.hourly_rate}/hr</span>
                      </span>
                    )}
                  </div>

                  {/* Service Category Tags */}
                  {pro.categories && pro.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {pro.categories.slice(0, 3).map((catName) => (
                        <span
                          key={catName}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                        >
                          {catName}
                        </span>
                      ))}
                      {pro.categories.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 font-semibold">
                          +{pro.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Starting Visit</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      ₹{pro.visiting_fee || '199'}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectProvider(pro)}
                    className="px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 hover:gap-2 active:scale-95"
                  >
                    <span>Book Pro</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
