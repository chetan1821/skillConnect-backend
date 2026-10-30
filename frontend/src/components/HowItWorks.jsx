import React from 'react';
import { Search, CalendarCheck, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export const HowItWorks = ({ onGetStarted }) => {
  const steps = [
    {
      num: '01',
      title: 'Find & Compare Pros',
      desc: 'Filter by specialized trade, read authentic client reviews, check verified experience years, and inspect transparent visiting fees.',
      icon: Search,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      num: '02',
      title: 'Book with Escrow Hold',
      desc: 'Pick your scheduled date and time slot. Your payment is held safely in platform escrow and a secure 4-digit Start OTP is generated.',
      icon: CalendarCheck,
      color: 'from-indigo-600 to-violet-600',
    },
    {
      num: '03',
      title: 'Verify & Release with OTP',
      desc: 'Share your Start OTP on arrival. Inspect the completed job and share your Completion OTP to release funds safely to the specialist.',
      icon: Award,
      color: 'from-violet-600 to-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100 dark:border-indigo-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Effortless & Secure</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How SkillConnect Works
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400">
            Getting certified home or business service takes three simple, escrow-backed steps.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50/70 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-950/30 group"
              >
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-200 dark:text-slate-700 group-hover:text-indigo-200 dark:group-hover:text-indigo-800 transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-800/40">
          <div>
            <h4 className="text-lg sm:text-2xl font-bold">Ready to Experience SkillConnect?</h4>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Create a free customer account in seconds and book top-rated verified specialists today.
            </p>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 flex-shrink-0 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>

      </div>
    </section>
  );
};
