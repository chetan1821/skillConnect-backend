import React from 'react';
import { Zap, Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = ({ onSelectCategory, categories = [] }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SkillConnect</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              SkillConnect connects households and businesses with certified, highly rated service specialists. Transparent pricing, background checks, and seamless bookings.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All specialists are ID-verified and license-checked</span>
            </div>
          </div>

          {/* Top Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Popular Services</h4>
            {categories && categories.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.id || cat.name}>
                    <button
                      onClick={() => onSelectCategory(cat.name)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Service categories synced from database</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#providers" className="hover:text-white transition-colors">Top Rated Specialists</a></li>
              <li><a href="#categories" className="hover:text-white transition-colors">All Trades & Skills</a></li>
              <li><span className="hover:text-white cursor-pointer">Provider Verification Program</span></li>
              <li><span className="hover:text-white cursor-pointer">Security & Protection Guarantee</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Office</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@skillconnect.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+91 (022) 8000-SKILL</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tech Park, Bengaluru / Mumbai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 SkillConnect Technologies Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Trust & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

