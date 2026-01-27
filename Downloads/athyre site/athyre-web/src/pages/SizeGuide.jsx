import React from 'react';
import { Ruler, Info, MessageSquare, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const SizeGuide = () => {
    return (
        <div className="pt-32 pb-24 px-8 max-w-6xl mx-auto min-h-screen">

            {/* SECTION 1: FIT PHILOSOPHY - Engineered for the Temple */}
            <section className="text-center mb-32 max-w-3xl mx-auto">
                <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Fit Philosophy</span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-8">Engineered for the Temple</h1>
                <p className="text-stone-500 text-sm leading-loose mb-12">
                    Our garments are designed to honor the body in motion and rest. We use high-compression performance fabrics for our "Rise" collection, and draped, relaxed fits for our "Sanctuary" pieces. If you are between sizes, we recommend sizing down for compassion and sizing up for comfort.
                </p>
                <ArrowDown className="w-6 h-6 mx-auto text-stone-300 animate-bounce" />
            </section>

            {/* SECTION 2: THE CHART */}
            <section className="mb-32">
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-12 text-center">Body Measurements (Inches)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-stone-200">
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-black text-stone-900">Size</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">US Size</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Bust</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Waist</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Hip</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-light text-stone-600">
                            {[
                                { size: 'XS', us: '0-2', bust: '30-32', waist: '23-25', hip: '33-35' },
                                { size: 'S', us: '4-6', bust: '33-35', waist: '26-28', hip: '36-38' },
                                { size: 'M', us: '8-10', bust: '36-38', waist: '29-31', hip: '39-41' },
                                { size: 'L', us: '12-14', bust: '39-41', waist: '32-34', hip: '42-44' },
                                { size: 'XL', us: '16-18', bust: '42-44', waist: '35-37', hip: '45-47' }
                            ].map((row, i) => (
                                <tr key={row.size} className={`hover:bg-stone-50 transition-colors ${i !== 4 ? 'border-b border-stone-100' : ''}`}>
                                    <td className="p-6 font-bold text-stone-900">{row.size}</td>
                                    <td className="p-6">{row.us}</td>
                                    <td className="p-6">{row.bust}"</td>
                                    <td className="p-6">{row.waist}"</td>
                                    <td className="p-6">{row.hip}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION 3: VISUAL REFERENCE - How to Measure */}
            <section className="mb-32 bg-stone-50 p-12 md:p-24 rounded-[2px] relative overflow-hidden">
                <div className="grid md:grid-cols-2 gap-16 items-center z-10 relative">
                    <div>
                        <h3 className="text-3xl font-serif italic mb-12">How To Measure</h3>
                        <div className="space-y-10">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest font-black block mb-2 text-stone-900">1. Bust</span>
                                <p className="text-[11px] text-stone-500 leading-relaxed">Measure under your arms at the fullest part of your bust. Keep the tape level.</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest font-black block mb-2 text-stone-900">2. Waist</span>
                                <p className="text-[11px] text-stone-500 leading-relaxed">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest font-black block mb-2 text-stone-900">3. Hip</span>
                                <p className="text-[11px] text-stone-500 leading-relaxed">Stand with your feet together and measure around the fullest part of your hips.</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract silhouette */}
                    <div className="flex justify-center opacity-60">
                        <div className="relative h-96 w-48 border-2 border-stone-300 rounded-full flex flex-col justify-between items-center py-10">
                            <div className="w-[120%] h-px bg-stone-900 absolute top-[25%]"><span className="absolute -left-12 -top-2 text-[9px]">BUST</span></div>
                            <div className="w-[80%] h-px bg-stone-900 absolute top-[45%]"><span className="absolute -right-14 -top-2 text-[9px]">WAIST</span></div>
                            <div className="w-[130%] h-px bg-stone-900 absolute top-[65%]"><span className="absolute -left-10 -top-2 text-[9px]">HIP</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: CONSULTATION - Still Unsure? */}
            <section className="text-center grid md:grid-cols-2 gap-8">
                <div className="border border-stone-200 p-12 hover:border-stone-900 transition-colors group cursor-pointer">
                    <MessageSquare className="w-8 h-8 mx-auto mb-6 text-stone-300 group-hover:text-stone-900 transition-colors" />
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">Chat with Stylist</h4>
                    <p className="text-stone-500 text-xs mb-8">Real-time guidance from our fit experts.</p>
                    <span className="text-[9px] uppercase tracking-widest border-b border-stone-900 pb-1">Start Chat</span>
                </div>
                <Link to="/contact" className="border border-stone-200 p-12 hover:border-stone-900 transition-colors group cursor-pointer">
                    <Info className="w-8 h-8 mx-auto mb-6 text-stone-300 group-hover:text-stone-900 transition-colors" />
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">Email Support</h4>
                    <p className="text-stone-500 text-xs mb-8">Response within 24 hours.</p>
                    <span className="text-[9px] uppercase tracking-widest border-b border-stone-900 pb-1">Contact Us</span>
                </Link>
            </section>

        </div>
    );
};

export default SizeGuide;
