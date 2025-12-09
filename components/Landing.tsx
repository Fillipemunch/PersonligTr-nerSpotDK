import React, { useState } from 'react';
import { Button, Card, Input } from './Shared';
import { User } from '../types';

interface LandingProps {
  t: any;
  featuredPTs: User[];
  onCtaClick: () => void;
  onViewProfile: (id: string) => void;
}

const Landing: React.FC<LandingProps> = ({ t, featuredPTs, onCtaClick, onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Local filtering for the landing page based on search input
  const displayPTs = featuredPTs.filter(pt => {
    const term = searchTerm.toLowerCase();
    return (
        pt.name.toLowerCase().includes(term) ||
        (pt.location && pt.location.toLowerCase().includes(term)) ||
        (pt.specialties && pt.specialties.some(s => s.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900 z-10"></div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
             <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent blur-[120px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-highlight blur-[120px]"></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto w-full">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            {t.heroTitle.split(' ').map((word: string, i: number) => (
              <span key={i} className={i % 2 !== 0 ? "text-brand-accent" : "text-white"}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          
          {/* SEARCH BAR */}
          <div className="max-w-xl mx-auto relative mb-6">
            <input 
                type="text" 
                placeholder={t.searchPlaceholder || "Search by name, city or specialty..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-600 rounded-full px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent shadow-2xl transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-accent text-brand-dark p-2 rounded-full hover:bg-cyan-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>

          <Button variant="primary" onClick={onCtaClick} className="text-lg px-8 py-3 mt-4">
            {t.findPt}
          </Button>
        </div>
      </section>

      {/* TRAINERS LIST SECTION (Filtered by Search) */}
      <section id="trainers-list" className="py-16 bg-slate-900 border-b border-slate-800">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">{t.meetTrainers || "Meet Our Trainers"}</h2>
                <div className="w-24 h-1 bg-brand-highlight mx-auto rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPTs.length > 0 ? (
                    displayPTs.map(pt => (
                      <Card key={pt.id} className="flex flex-col h-full neon-card bg-slate-800/50 backdrop-blur-sm border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={pt.photoUrl || "https://via.placeholder.com/150"} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
                            alt={pt.name} 
                          />
                          <div>
                            <h3 className="font-bold text-white text-lg">{pt.name}</h3>
                            <p className="text-xs text-brand-accent uppercase font-bold tracking-wide">{pt.location}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {pt.specialties?.map((s, i) => (
                              <span key={i} className="text-[10px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600">{s}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3 italic">
                            "{pt.bio || 'Professional trainer ready to help you.'}"
                        </p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                          <span className="font-bold text-white">{pt.hourlyRate} DKK<span className="text-xs font-normal text-slate-500">/hr</span></span>
                          <Button variant="secondary" onClick={onCtaClick} className="!py-1.5 !px-4 text-sm shadow-md">
                            {t.viewProfile}
                          </Button>
                        </div>
                      </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-slate-500 text-lg">
                            {featuredPTs.length === 0 ? t.noTrainersYet : t.noTrainersFound}
                        </p>
                    </div>
                )}
            </div>
         </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
         {/* Subtle Background Glow for Section */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl opacity-10 bg-gradient-radial from-brand-accent/20 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white inline-block relative">
                    {t.howItWorksTitle}
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent"></div>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Step 1 - Cyan Neon */}
                <div className="flex flex-col items-center text-center group neon-card p-6 rounded-xl bg-slate-800/20 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-brand-accent neon-glow-cyan animate-float delay-100 bg-slate-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">{t.step1Title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.step1Desc}</p>
                </div>

                {/* Step 2 - Cyan Neon */}
                <div className="flex flex-col items-center text-center group neon-card p-6 rounded-xl bg-slate-800/20 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-brand-accent neon-glow-cyan animate-float delay-200 bg-slate-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">{t.step2Title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.step2Desc}</p>
                </div>

                {/* Step 3 - Orange Neon */}
                <div className="flex flex-col items-center text-center group neon-card p-6 rounded-xl bg-slate-800/20 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-brand-highlight neon-glow-orange animate-float delay-300 bg-slate-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-highlight transition-colors">{t.step3Title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.step3Desc}</p>
                </div>

                {/* Step 4 - Orange Neon */}
                <div className="flex flex-col items-center text-center group neon-card p-6 rounded-xl bg-slate-800/20 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-brand-highlight neon-glow-orange animate-float delay-400 bg-slate-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-highlight transition-colors">{t.step4Title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.step4Desc}</p>
                </div>
            </div>
        </div>
      </section>

      {/* MOTIVATIONAL NEON SECTION (Compact & Animated) */}
      <section className="py-16 bg-black relative overflow-hidden flex items-center justify-center border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex flex-col items-center">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center mb-8">
             <span className="text-5xl md:text-6xl font-black text-neon-cyan tracking-tighter leading-tight animate-pulse-slow whitespace-nowrap">
               {t.aboutText.split('.')[0]}.
             </span>
             <span className="text-5xl md:text-6xl font-black text-neon-orange tracking-tighter leading-tight animate-pulse-slow delay-100 whitespace-nowrap">
               {t.aboutText.split('.').slice(1).join('.')}
             </span>
          </div>
          
          <Button onClick={onCtaClick} variant="outline" className="!px-8 !py-2 text-lg font-bold hover:bg-white hover:text-black transition-all">
              Start Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;