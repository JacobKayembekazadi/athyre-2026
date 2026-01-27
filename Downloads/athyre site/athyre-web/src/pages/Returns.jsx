import React, { useState } from 'react';
import { RotateCcw, AlertCircle, PackageCheck, ArrowRight, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns = () => {
    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: PHILOSOPHY - The Promise */}
            <section className="text-center mb-32 max-w-3xl mx-auto">
                <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Satisfaction</span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-8">The Promise</h1>
                <p className="text-stone-500 text-sm leading-loose mb-12">
                    We want your sanctuary to feel perfect. If a piece does not honor your body or practice, we invite you to return it. Our process is designed to be as seamless as the garments themselves.
                </p>
            </section>

            {/* SECTION 2: RULES - The Covenant */}
            <section className="mb-32">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <RotateCcw />, title: "30 Days", desc: "Returns accepted within 30 days of delivery." },
                        { icon: <AlertCircle />, title: "Condition", desc: "Must be unworn, unwashed, with tags attached." },
                        { icon: <PackageCheck />, title: "Free Returns", desc: "We provide a pre-paid shipping label for US orders." }
                    ].map((rule, i) => (
                        <div key={i} className="bg-white border border-stone-100 p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-shadow duration-500 rounded-[2px]">
                            <div className="text-stone-900 mb-6 w-10 h-10">{rule.icon}</div>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">{rule.title}</h3>
                            <p className="text-[11px] text-stone-500 leading-relaxed">{rule.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 3: PORTAL - Start Your Return */}
            <section className="mb-32 bg-stone-900 text-white rounded-[2px] overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                <div className="p-16 md:p-32 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-6">Initiate A Return</h2>
                    <p className="text-stone-400 text-sm mb-12 max-w-md mx-auto">Enter your order number and email to retrieve your order and select items to return.</p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto">
                        <input type="text" placeholder="ORDER # (e.g. 10234)" className="bg-white/10 border border-white/20 p-4 text-[10px] tracking-[0.2em] font-bold text-white placeholder:text-stone-500 focus:outline-none focus:bg-white/20 uppercase w-full" />
                        <input type="email" placeholder="EMAIL ADDRESS" className="bg-white/10 border border-white/20 p-4 text-[10px] tracking-[0.2em] font-bold text-white placeholder:text-stone-500 focus:outline-none focus:bg-white/20 uppercase w-full" />
                    </div>
                    <button className="mt-8 bg-white text-stone-900 px-12 py-4 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-stone-200 transition-colors shadow-lg">
                        Find Order
                    </button>
                </div>
            </section>

            {/* SECTION 4: EXCHANGE INCENTIVES - Exchange & Save */}
            <section className="grid lg:grid-cols-2 gap-16 items-center bg-stone-50 rounded-[2px] p-12">
                <div>
                    <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-8">Exchange Bonus</h2>
                    <h3 className="text-3xl font-serif italic mb-6">Swap For Something New</h3>
                    <p className="text-stone-600 text-sm leading-loose mb-8">
                        Choose store credit or an instant exchange instead of a refund, and we will gift you an additional <span className="font-bold border-b border-stone-800">$10 bonus</span> towards your next piece.
                    </p>
                    <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black border-b border-stone-900 pb-1 hover:opacity-60 transition-opacity">
                        Browse The Shop <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Mini Gallery of New Arrivals to tempt exchange */}
                    <div className="aspect-[3/4] bg-white p-4 text-center">
                        <Shirt className="w-12 h-12 mx-auto mt-8 mb-4 text-stone-200" />
                        <span className="text-[9px] uppercase tracking-widest block text-stone-400">New Arrival</span>
                    </div>
                    <div className="aspect-[3/4] bg-white p-4 text-center">
                        <Shirt className="w-12 h-12 mx-auto mt-8 mb-4 text-stone-200" />
                        <span className="text-[9px] uppercase tracking-widest block text-stone-400">Restocked</span>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Returns;
