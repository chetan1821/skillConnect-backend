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
  ArrowRight
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
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <section id="categories" className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              Explore Our Expertise
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Select a specialized domain to view certified providers ready to assist you today.
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="mt-4 md:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Clear Filter ({selectedCategory})</span>
              <span className="text-lg">&times;</span>
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Tag;
            const isSelected = selectedCategory === cat.name;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/25 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.provider_count || 12}+ Pros
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold tracking-tight mb-2 ${
                      isSelected ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-white' : 'text-indigo-600'}>
                    {isSelected ? 'Currently Selected' : 'View Providers'}
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-white' : 'text-indigo-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

