import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    X,
    CheckCircle2,
    Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState('spirit');

    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const intentions = {
        spirit: { verse: "1 Corinthians 6:19", text: "Your body is a temple. We design for the sanctuary that is you.", action: "Meditate on Gratitude", color: "bg-rose-50/50" },
        soul: { verse: "Proverbs 4:23", text: "Guard your heart. Find peace in the movement and stillness alike.", action: "Set a Daily Boundary", color: "bg-stone-50/50" },
        body: { verse: "1 Timothy 4:8", text: "Physical training has value; we ensure that value is met with excellence.", action: "Move with Purpose", color: "bg-blue-50/50" }
    };

    const products = [
        { id: 1, name: "Sabbath Ribbed Legging", price: "$128", tag: "The Core Piece", image: "/images/product-1.jpg", hoverImage: "/images/product-1.jpg" },
        { id: 2, name: "Grace-Float Sports Bra", price: "$74", tag: "Ethereal Support", image: "/images/product-2.jpg", hoverImage: "/images/product-2.jpg" },
        { id: 3, name: "Sanctuary Oversized Zip", price: "$165", tag: "Pre-order", image: "/images/product-3.jpg", hoverImage: "/images/product-3.jpg" },
        { id: 4, name: "Elysian Biker Short", price: "$68", tag: "New", image: "/images/product-4.jpg", hoverImage: "/images/product-4.jpg" }
    ];

    return (
        <>
            {/* 0. CONVERSION POPUP */}
            {showPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl grid md:grid-cols-2 overflow-hidden relative shadow-2xl">
                        <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 z-20 text-stone-400 hover:text-stone-900"><X /></button>
                        <div className="hidden md:block">
                            <img src="/images/hero-main.jpg" className="h-full w-full object-cover" alt="Join us" />
                        </div>
                        <div className="p-10 md:p-16 flex flex-col justify-center text-center md:text-left">
                            <h2 className="text-3xl font-light tracking-tight mb-4 uppercase">Unlock 15% Off Your First Order</h2>
                            <p className="text-stone-500 text-sm mb-8 leading-relaxed">Be the first to know about our intentional drops, sacred rituals, and exclusive member-only sales.</p>
                            <div className="space-y-4">
                                <input type="email" placeholder="ENTER YOUR EMAIL" className="w-full border-b border-stone-200 py-3 text-[10px] tracking-[0.2em] focus:outline-none focus:border-stone-900 uppercase" />
                                <div className="flex gap-4 justify-center md:justify-start">
                                    <label className="flex items-center gap-2 text-[10px] tracking-widest cursor-pointer uppercase"><input type="checkbox" className="accent-stone-900" /> Women's</label>
                                    <label className="flex items-center gap-2 text-[10px] tracking-widest cursor-pointer uppercase"><input type="checkbox" className="accent-stone-900" /> Men's</label>
                                </div>
                                <button className="w-full bg-stone-900 text-white py-4 text-[10px] tracking-[0.3em] font-black uppercase hover:bg-stone-800 transition-colors shadow-lg">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. HERO: Move With Purpose */}
            <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105 brightness-[0.7] contrast-[1.1]">
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-a-sunny-room-40156-large.mp4" type="video/mp4" />
                </video>
                <div className="relative z-20 text-center text-white px-6 mt-20">
                    <h1 className="text-6xl md:text-[10vw] font-light leading-none tracking-tighter mb-6 drop-shadow-2xl">
                        Move With <br /><span className="italic font-serif">Purpose</span>
                    </h1>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] mb-10 font-black opacity-80">Unveiling Soon • Limited Availability</p>
                    <Link to="/shop" className="bg-white text-stone-900 px-16 py-6 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#E5D5C5] transition-all duration-700 shadow-2xl scale-100 hover:scale-105 inline-block">
                        Shop The Drop
                    </Link>
                </div>
            </section>

            {/* 2. THE RISE COLLECTION */}
            <section className="py-32 px-4 max-w-[1600px] mx-auto">
                <div className="text-center mb-20">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Volume 01</span>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tight uppercase">The Rise Collection</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", title: "Rise into your potential", color: "BLACK" },
                        { img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8", title: "Rise above the doubt", color: "NAVY" },
                        { img: "https://images.unsplash.com/photo-1583454110551-21f2fa20019b", title: "Rise to the occasion", color: "CHERRY" }
                    ].map((col, idx) => (
                        <div key={idx} className="relative aspect-[3/4] group overflow-hidden cursor-pointer">
                            <img src={`${col.img}?auto=format&fit=crop&q=80&w=1000`} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" alt={col.title} />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                                <h3 className="text-2xl md:text-3xl font-serif italic mb-6 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-y-4 group-hover:translate-y-0">{col.title}</h3>
                                <div className="mt-auto">
                                    <Link to="/shop" className="bg-white/90 text-stone-900 px-8 py-3 text-[9px] tracking-[0.3em] font-black uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 inline-block">Shop {col.color}</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. PRODUCT GRID */}
            <section className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.map((product) => (
                        <div key={product.id} className="group">
                            <Link to={`/product/${product.id}`} className="block">
                                <div className="relative aspect-[3/4] overflow-hidden bg-stone-50 mb-6 rounded-[2px]">
                                    <img src={product.image} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-105" alt={product.name} />
                                    <img src={product.hoverImage} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-1000 group-hover:opacity-100" alt={`${product.name} detail`} />
                                    <button className="absolute bottom-6 left-6 right-6 bg-stone-900 text-white py-4 text-[9px] uppercase tracking-[0.3em] font-black translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                                        Quick Add — {product.price}
                                    </button>
                                </div>
                                <h3 className="text-[12px] font-bold tracking-widest uppercase mb-1">{product.name}</h3>
                                <p className="text-stone-400 text-[11px] uppercase tracking-wider">{product.price}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. THE INTENTION SETTER */}
            <section className="py-32 bg-[#FAF9F6] border-y border-stone-100">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <h2 className="text-4xl md:text-5xl font-light mb-16 uppercase tracking-tight">Set Your Daily <span className="italic font-serif">Intention</span></h2>
                    <div className="flex justify-center gap-4 md:gap-12 mb-16">
                        {['spirit', 'soul', 'body'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[11px] uppercase tracking-[0.4em] font-black pb-4 transition-all border-b-2 ${activeTab === tab ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-300'}`}>{tab}</button>
                        ))}
                    </div>
                    <div className={`p-16 rounded-[2px] shadow-sm transition-all duration-700 ${intentions[activeTab].color}`}>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mb-6 block">{intentions[activeTab].verse}</span>
                        <p className="text-2xl md:text-3xl font-light text-stone-700 leading-relaxed mb-10 italic font-serif italic">"{intentions[activeTab].text}"</p>
                        <button className="flex items-center gap-3 mx-auto text-[10px] uppercase tracking-[0.3em] font-black group transition-all hover:gap-6">
                            {intentions[activeTab].action} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. JOURNAL PREVIEW - Refined Minimal Layout */}
            <section className="py-40 bg-white">
                <div className="max-w-4xl mx-auto text-center px-8 flex flex-col items-center">
                    <div className="h-20 w-px bg-stone-100 mb-12" />

                    <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12">From The Journal</h2>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-20">
                        {['Recipe', 'Playlist', 'Fitness Tip'].map((cat) => (
                            <button key={cat} className="group flex flex-col items-center">
                                <span className="text-[13px] uppercase tracking-[0.3em] font-bold text-stone-800 border-b border-transparent group-hover:border-stone-800 transition-all pb-1">[ {cat} ]</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-24 w-px bg-stone-100 mb-12" />

                    <p className="text-2xl md:text-4xl font-serif italic text-stone-800 mb-16 tracking-tight">
                        Nourishment for body, mind, and spirit
                    </p>

                    <div className="h-12 w-px bg-stone-100 mb-12" />

                    <Link to="/journal" className="group relative px-12 py-5 border border-stone-900 overflow-hidden transition-colors inline-block">
                        <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] font-black group-hover:text-white transition-colors">
                            [ Visit The Journal ]
                        </span>
                        <div className="absolute inset-0 bg-stone-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </Link>

                    <div className="h-20 w-px bg-stone-100 mt-20" />
                </div>
            </section>

            {/* 6. EMAIL + COMMUNITY INVITE */}
            <section className="bg-stone-50 py-32 border-y border-stone-100">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="bg-white p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Mail className="w-64 h-64 text-stone-900" />
                        </div>

                        <div className="md:w-1/2 relative z-10">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">The Collective</span>
                            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight uppercase">Community <br /><span className="italic font-serif lowercase">of stewards</span></h2>
                            <p className="text-stone-500 text-sm leading-relaxed font-light mb-10 max-w-sm italic">
                                Join our private sanctuary for early access to drops, guided meditations, and physical training insights.
                            </p>
                            <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Exclusive Events</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> First Access</div>
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full relative z-10">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="ENTER YOUR EMAIL ADDRESS"
                                        className="w-full bg-transparent border-b border-stone-200 py-4 text-[10px] tracking-[0.3em] focus:outline-none focus:border-stone-900 transition-colors uppercase placeholder:text-stone-300"
                                    />
                                </div>
                                <button className="w-full bg-stone-900 text-white py-5 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-stone-800 transition-all shadow-xl group flex items-center justify-center gap-4">
                                    Join The Community <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </button>
                                <p className="text-[8px] uppercase tracking-widest text-stone-400 text-center">By joining, you agree to our terms of stewardship.</p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
