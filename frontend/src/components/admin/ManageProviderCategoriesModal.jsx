import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { X, Layers, CheckCircle, Plus, Trash2, RefreshCw } from 'lucide-react';

export const ManageProviderCategoriesModal = ({ provider, onClose, onUpdated }) => {
  const { showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingCatId, setUpdatingCatId] = useState(null);

  const fetchCategoriesDetail = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await api.getProviderCategoriesDetail(provider.id);
      setCategories(data.categories || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch provider categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesDetail();
  }, [provider?.id]);

  if (!provider) return null;

  const handleToggleCategory = async (cat) => {
    setUpdatingCatId(cat.id);
    try {
      if (cat.is_assigned) {
        await api.removeCategoryFromProvider(provider.id, cat.id);
        showToast(`Skill '${cat.name}' removed from ${provider.business_name}`, 'info');
      } else {
        await api.assignCategoryToProvider(provider.id, cat.id);
        showToast(`Skill '${cat.name}' assigned to ${provider.business_name}`, 'success');
      }

      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, is_assigned: !c.is_assigned } : c))
      );
      if (onUpdated) onUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to update trade specialization', 'error');
    } finally {
      setUpdatingCatId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manage Trade Specialties</h3>
              <p className="text-xs text-slate-400">
                Attach or detach trade skills for <strong>{provider.business_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-xs">Loading available trades...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No service categories registered. Create categories under the Categories tab first.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  cat.is_assigned
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className={cat.is_assigned ? 'text-indigo-300' : 'text-slate-300'}>
                      {cat.name}
                    </span>
                    {cat.is_assigned && (
                      <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        Active Skill
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {cat.description}
                    </div>
                  )}
                </div>

                <button
                  disabled={updatingCatId === cat.id}
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    cat.is_assigned
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {cat.is_assigned ? (
                    <>
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

