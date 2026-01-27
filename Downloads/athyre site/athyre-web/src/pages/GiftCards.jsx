import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Gift, ArrowRight } from 'lucide-react';

const GiftCards = () => {
    const [selectedAmount, setSelectedAmount] = useState(100);

    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: HERO - The Gift of Stewardship */}
            <section className="grid md:grid-cols-2 gap-16 items-center mb-32">
                <div className="order-2 md:order-1">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">The Gift of Choice</span>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-8">Stewardship Shared</h1>
                    <p className="text-stone-500 text-sm leading-loose mb-8">
                        Honor their journey with the freedom to choose their own sanctuary. Our digital gift cards are delivered instantly, a conscious alternative to physical waste.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-bold"><CheckCircle2 className="w-4 h-4 text-stone-900" /> Never Expires</div>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-bold"><CheckCircle2 className="w-4 h-4 text-stone-900" /> Instant Delivery</div>
                    </div>
                </div>
                <div className="order-1 md:order-2 aspect-[4/3] bg-stone-100 flex items-center justify-center relative overflow-hidden rounded-[2px] shadow-2xl">
                    <div className="absolute inset-0 bg-stone-200">
                        {/* Abstract Card Visual */}
                        <div className="w-[80%] h-[60%] bg-stone-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl flex flex-col justify-between p-8 text-white">
                            <div className="flex justify-between items-start">
                                <span className="text-xl tracking-[0.2em] font-light uppercase">Athyre</span>
                                <span className="text-sm font-mono tracking-widest">{selectedAmount > 0 ? `$${selectedAmount}` : 'GIFT'}</span>
                            </div>
                            <div className="text-[8px] tracking-[0.3em] font-mono opacity-60">
                                XXXX XXXX XXXX 0824
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: SELECTION - Choose Your Offering */}
            <section className="mb-32 max-w-2xl mx-auto text-center">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12">Select Contribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[50, 100, 200, 500].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`py-6 border ${selectedAmount === amount ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-400'} transition-all text-xl font-serif italic`}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <button className="w-full bg-stone-900 text-white py-5 text-[10px] tracking-[0.3em] font-black uppercase hover:bg-stone-800 transition-colors shadow-lg">
                    Add to Bag — ${selectedAmount}
                </button>
            </section>

            {/* SECTION 3: REDEMPTION RITUAL - How It Works */}
            <section className="mb-32 bg-stone-50 p-16 rounded-[2px]">
                <div className="grid md:grid-cols-3 gap-12 text-center">
                    <div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-stone-900">
                            <Gift className="w-6 h-6" />
                        </div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">1. Select & Send</h3>
                        <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mx-auto">Choose the amount and receive a beautifully crafted digital card directly to your inbox instantly.</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-stone-900">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">2. Forward the Gift</h3>
                        <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mx-auto">Forward the email to the recipient with your personal note of encouragement.</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-stone-900">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">3. Redeem Online</h3>
                        <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mx-auto">The unique code can be applied at checkout for any piece in our collection.</p>
                    </div>
                </div>
            </section>

            {/* SECTION 4: BALANCE CHECK */}
            <section className="text-center border-t border-stone-100 pt-20">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-8">Already Have A Card?</h2>
                <div className="flex flex-col md:flex-row justify-center gap-0 max-w-lg mx-auto">
                    <input type="text" placeholder="ENTER CARD NUMBER" className="w-full bg-stone-50 p-4 text-[10px] tracking-[0.2em] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-stone-200" />
                    <button className="bg-stone-900 text-white px-8 py-4 text-[10px] tracking-[0.3em] font-black uppercase whitespace-nowrap hover:bg-stone-800 transition-colors">Check Balance</button>
                </div>
            </section>

        </div>
    );
};

export default GiftCards;
