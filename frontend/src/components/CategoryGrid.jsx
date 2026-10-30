import React from 'react';
import {
  Zap,
  Droplets,
  Hammer,
  Wind,
  Paintbrush,
  Wrench,
  Sparkles,
  ShieldAlert,
  Tag,
  ArrowRight,
  Layers
} from 'lucide-react';

const ICON_MAP = {
  Zap: Zap,
  Droplets: Droplets,
  Hammer: Hammer,
  Wind: Wind,
  Paintbrush: Paintbrush,
  Wrench: Wrench,
  Sparkles: Sparkles,
  ShieldAlert: ShieldAlert,
  Tag: Tag,
};

export const CategoryGrid = ({
  categories = [],
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <section id="categories" className="py-14 sm:py-20 bg-white dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100 dark:border-indigo-800/60">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse Categories</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Service Categories & Trades
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Tap any trade to view vetted specialists available on the platform in real time.
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="mt-3 md:mt-0 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto"
            >
              <span>Clear Filter ({selectedCategory})</span>
              <span className="text-lg leading-none">&times;</span>
            </button>
          )}
        </div>

        {/* Categories Responsive Grid (2-columns on mobile, up to 5 on large screens) */}
        {categories.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Tag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No categories added yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Categories created by administrators will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {categories.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || Tag;
              const isSelected = selectedCategory === cat.name;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                  className={`group cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/30 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800/70 hover:bg-slate-50/80 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-indigo-950/40 active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/80'
                        }`}
                      >
                        Active
                      </span>
                    </div>

                    <h3
                      className={`text-xs sm:text-base font-bold tracking-tight mb-1.5 leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}
                    >
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p
                        className={`hidden sm:block text-xs line-clamp-2 leading-relaxed ${
                          isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 border-t border-current/10 flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                    <span className={isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>
                      {isSelected ? 'Selected' : 'View Pros'}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                        isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
