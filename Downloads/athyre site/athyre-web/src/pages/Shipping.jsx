import React, { useState } from 'react';
import { Truck, Globe, Box, Clock } from 'lucide-react';

const Shipping = () => {
    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: VISUAL TIMELINE - From Sanctuary to You */}
            <section className="mb-32">
                <div className="text-center mb-20">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">The Journey</span>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-8">From Sanctuary To You</h1>
                </div>
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-stone-200 -z-10 hidden md:block" />
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Preparation", desc: "Your piece is hand-checked and blessed with intention.", date: "Day 1" },
                            { step: "02", title: "Dispatch", desc: "Eco-conscious packaging seals the garment.", date: "Day 2" },
                            { step: "03", title: "Arrival", desc: "Delivered to your door, ready for the temple.", date: "Day 3-5" }
                        ].map((item, i) => (
                            <div key={i} className="text-center bg-white p-6 md:bg-transparent">
                                <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-bold shadow-xl border-4 border-white">{item.step}</div>
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">{item.title}</h3>
                                <p className="text-[11px] text-stone-500 mb-2">{item.desc}</p>
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 2: OPTIONS TABLE */}
            <section className="mb-32 max-w-5xl mx-auto">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12 text-center">Shipping Offerings</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="border border-stone-200 p-8 hover:border-stone-900 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <Truck className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Domestic (US)</span>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex justify-between text-sm text-stone-600 border-b border-stone-100 pb-2">
                                <span>Standard (3-5 Days)</span>
                                <span className="font-bold">Free over $150</span>
                            </li>
                            <li className="flex justify-between text-sm text-stone-600 border-b border-stone-100 pb-2">
                                <span>Express (2 Days)</span>
                                <span className="font-bold">$25</span>
                            </li>
                            <li className="flex justify-between text-sm text-stone-600 pb-2">
                                <span>Overnight</span>
                                <span className="font-bold">$45</span>
                            </li>
                        </ul>
                    </div>
                    <div className="border border-stone-200 p-8 hover:border-stone-900 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <Globe className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">International</span>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex justify-between text-sm text-stone-600 border-b border-stone-100 pb-2">
                                <span>Canada / Mexico</span>
                                <span className="font-bold">$30</span>
                            </li>
                            <li className="flex justify-between text-sm text-stone-600 border-b border-stone-100 pb-2">
                                <span>Europe / UK</span>
                                <span className="font-bold">$45</span>
                            </li>
                            <li className="flex justify-between text-sm text-stone-600 pb-2">
                                <span>Rest of World</span>
                                <span className="font-bold">$60</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* SECTION 3: SUSTAINABLE PACKAGING */}
            <section className="mb-32 bg-[#F5F5F0] rounded-[2px] overflow-hidden">
                <div className="grid md:grid-cols-2 items-center">
                    <div className="p-16">
                        <Box className="w-12 h-12 mb-8 text-stone-800" />
                        <h2 className="text-3xl font-serif italic mb-6">Earth-First Packaging</h2>
                        <p className="text-stone-600 text-sm leading-loose mb-8">
                            We believe the unboxing ritual shouldn't burden the earth. Our mailers are 100% compostable, made from cornstarch. Our tissue is recycled and printed with soy-based inks.
                        </p>
                        <ul className="space-y-2 text-[10px] uppercase tracking-widest font-bold text-stone-500">
                            <li>• Zero Plastic</li>
                            <li>• 100% Recyclable Boxes</li>
                            <li>• Minimalist Insert Cards</li>
                        </ul>
                    </div>
                    <div className="h-full min-h-[400px]">
                        <img src="https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale contrast-125" alt="Packaging" />
                    </div>
                </div>
            </section>

            {/* SECTION 4: TRACK YOUR RITUAL */}
            <section className="text-center max-w-xl mx-auto">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-8">Track Your Ritual</h2>
                <div className="relative">
                    <input type="text" placeholder="ENTER TRACKING NUMBER" className="w-full bg-white border border-stone-200 p-6 text-[10px] tracking-[0.2em] font-bold uppercase focus:outline-none focus:border-stone-900 shadow-lg placeholder:text-stone-300" />
                    <button className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-6 text-[9px] uppercase tracking-widest font-black hover:bg-stone-800 transition-colors">
                        Track
                    </button>
                </div>
                <p className="mt-8 text-[9px] uppercase tracking-widest text-stone-400">
                    <Clock className="w-3 h-3 inline mr-2" />
                    Average dispatch time: 24 Hours
                </p>
            </section>

        </div>
    );
};

export default Shipping;
