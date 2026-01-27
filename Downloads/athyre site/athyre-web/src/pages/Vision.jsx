import React from 'react';
import { Leaf, Heart, Globe, ArrowDown } from 'lucide-react';

const Vision = () => {
    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: MANIFESTO */}
            <section className="min-h-[80vh] flex flex-col justify-center items-center text-center relative mb-32">
                <h1 className="text-5xl md:text-[8vw] leading-[0.9] font-light tracking-tighter uppercase mb-12 mix-blend-difference">
                    Create <br /> <span className="font-serif italic text-stone-400">Sanctuary</span> <br /> Through <br /> Movement.
                </h1>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-900 border-b-2 border-stone-900 pb-2">Read The Manifesto</p>
                <ArrowDown className="absolute bottom-10 w-6 h-6 animate-bounce text-stone-300" />
            </section>

            {/* SECTION 2: FOUNDER'S NOTE */}
            <section className="grid md:grid-cols-2 gap-20 items-center mb-40">
                <div className="aspect-[3/4] bg-stone-100 grayscale hover:grayscale-0 transition-all duration-700">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Founder" />
                </div>
                <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-8">From The Founder</span>
                    <p className="text-2xl md:text-3xl font-serif italic text-stone-800 leading-relaxed mb-10">
                        "We didn't start Athyre to make clothes. We started it to make space. Space for the body to breathe, for the mind to quiet, and for the spirit to rise."
                    </p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_sample.svg" className="h-12 opacity-50" alt="Signature" />
                </div>
            </section>

            {/* SECTION 3: THE JOURNEY (TIMELINE) */}
            <section className="mb-40 overflow-hidden">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12 px-8">The Path</h2>
                <div className="flex gap-16 overflow-x-auto pb-12 px-8 scrollbar-hide snap-x">
                    {[
                        { year: '2022', title: 'The Inception', desc: 'Concept born in a quiet room.' },
                        { year: '2023', title: 'First Material', desc: 'Sourcing the perfect sanctuary fabric.' },
                        { year: '2024', title: 'The Launch', desc: 'Athyre opens its doors to the world.' },
                        { year: '2025', title: 'The Expansion', desc: 'Building the physical temple locations.' }
                    ].map((point, i) => (
                        <div key={i} className="min-w-[300px] border-l-2 border-stone-200 pl-8 snap-start">
                            <span className="text-4xl font-light text-stone-200 mb-4 block">{point.year}</span>
                            <h3 className="text-xl font-serif italic mb-2">{point.title}</h3>
                            <p className="text-[11px] uppercase tracking-widest text-stone-500">{point.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 4: IMPACT STATS */}
            <section className="bg-stone-900 text-white rounded-[2px] p-24 text-center">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-20">Stewardship In Action</h2>
                <div className="grid md:grid-cols-3 gap-20">
                    <div className="flex flex-col items-center">
                        <Leaf className="w-12 h-12 mb-8 text-stone-500" />
                        <span className="text-5xl font-light mb-4 block">100%</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Ethical Production</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Heart className="w-12 h-12 mb-8 text-stone-500" />
                        <span className="text-5xl font-light mb-4 block">$50k</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Donated to Mental Health</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Globe className="w-12 h-12 mb-8 text-stone-500" />
                        <span className="text-5xl font-light mb-4 block">50+</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Countries Served</span>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Vision;
