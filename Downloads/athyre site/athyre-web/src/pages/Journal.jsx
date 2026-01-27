import React from 'react';

const Journal = () => {
    return (
        <div className="pt-40 px-8 max-w-4xl mx-auto min-h-screen text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">The Journal</span>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight uppercase mb-12">Words & Wisdom</h1>
            <p className="text-stone-500 text-lg font-serif italic mb-20 leading-relaxed">
                "The body benefits from movement, and the mind benefits from stillness." — <span className="not-italic text-[10px] uppercase tracking-widest font-bold">Sakyong Mipham</span>
            </p>

            <div className="space-y-20 text-left">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="group cursor-pointer">
                        <div className="aspect-video bg-stone-100 mb-8 overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000&id=${item}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Journal Entry" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Wellness • Oct 12</span>
                        <h3 className="text-2xl font-serif italic mt-2 group-hover:text-stone-600 transition-colors">Finding stillness in a chaotic world.</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Journal;
