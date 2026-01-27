import React, { useState } from 'react';
import { Mail, MessageCircle, Building2, Plus, Minus, ArrowRight } from 'lucide-react';

const Contact = () => {
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        { q: "Where is my order?", a: "Once your sanctuary items are dispatched, you will receive a tracking link via email. Orders typically ship within 1-2 business days." },
        { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries. International shipping times vary between 5-10 business days." },
        { q: "What is your return policy?", a: "We accept returns of unworn items with tags attached within 30 days of delivery." }
    ];

    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: HERO */}
            <section className="text-center mb-32">
                <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Support</span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-8">Connect With Council</h1>
                <p className="text-stone-500 text-sm leading-loose max-w-2xl mx-auto">
                    Our team is here to support your journey. Whether you have questions about fit, fabric, or philosophy, we are ready to listen.
                </p>
            </section>

            {/* SECTION 2: CHANNEL GRID */}
            <section className="grid md:grid-cols-3 gap-8 mb-32">
                {[
                    { icon: <MessageCircle className="w-6 h-6" />, title: "Order Support", desc: "For help with current orders.", action: "support@athyre.com" },
                    { icon: <Building2 className="w-6 h-6" />, title: "Wholesale", desc: "Partner with us.", action: "partners@athyre.com" },
                    { icon: <Mail className="w-6 h-6" />, title: "Press & Media", desc: "Share our story.", action: "press@athyre.com" }
                ].map((channel, i) => (
                    <div key={i} className="bg-stone-50 p-12 text-center group hover:bg-stone-900 hover:text-white transition-all duration-500">
                        <div className="bg-white text-stone-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:bg-white/10 group-hover:text-white transition-colors">{channel.icon}</div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">{channel.title}</h3>
                        <p className="text-[11px] text-stone-500 mb-8 group-hover:text-stone-400">{channel.desc}</p>
                        <span className="text-[10px] font-bold border-b border-stone-200 pb-1 group-hover:border-stone-700">{channel.action}</span>
                    </div>
                ))}
            </section>

            {/* SECTION 3: THE FORM & FAQ SPLIT */}
            <section className="grid lg:grid-cols-2 gap-20 mb-32">
                {/* FAQ Column */}
                <div>
                    <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12">Common Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((item, index) => (
                            <div key={index} className="border-b border-stone-100">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                                    className="w-full py-6 flex justify-between items-center text-left hover:text-stone-600 transition-colors"
                                >
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold pr-8">{item.q}</span>
                                    {openFaq === index ? <Minus className="w-4 h-4 flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ${openFaq === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-stone-500 text-sm leading-relaxed">{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Column */}
                <div className="bg-white border border-stone-100 p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -mr-16 -mt-16 z-0" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-serif italic mb-8">Send a Message</h2>
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-stone-400">First Name</label>
                                    <input type="text" className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-stone-900 transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Order # (Optional)</label>
                                    <input type="text" className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-stone-900 transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Email Address</label>
                                <input type="email" className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-stone-900 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Message</label>
                                <textarea rows="4" className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-stone-900 transition-colors resize-none"></textarea>
                            </div>
                            <button className="w-full bg-stone-900 text-white py-4 text-[10px] tracking-[0.3em] font-black uppercase hover:bg-stone-800 transition-colors shadow-lg flex justify-between px-8">
                                <span>Send Message</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Contact;
