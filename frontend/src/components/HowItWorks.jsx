import React from 'react';
import { Search, CalendarCheck, Award, ArrowRight } from 'lucide-react';

export const HowItWorks = ({ onGetStarted }) => {
  const steps = [
    {
      num: '01',
      title: 'Find & Compare Pros',
      desc: 'Filter by specialized trade, read authentic client reviews, check verified experience years, and inspect pricing.',
      icon: Search,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      num: '02',
      title: 'Book Instantly',
      desc: 'Pick your preferred date and time slot. No endless back-and-forth phone calls or hidden travel fees.',
      icon: CalendarCheck,
      color: 'from-indigo-600 to-violet-600',
    },
    {
      num: '03',
      title: 'Certified Completion',
      desc: 'Your vetted technician arrives on schedule. Inspect the completed job and pay safely with satisfaction guaranteed.',
      icon: Award,
      color: 'from-violet-600 to-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            Effortless Experience
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SkillConnect Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Getting skilled help for your home or enterprise takes three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50/70 rounded-3xl p-8 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Are you a licensed professional or service provider?
            </h3>
            <p className="text-sm sm:text-base text-indigo-200 mt-2 max-w-xl">
              Join the fastest-growing local network. Grow your client base, get verified, and receive bookings directly.
            </p>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm shadow-lg whitespace-nowrap transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Partner With SkillConnect</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

