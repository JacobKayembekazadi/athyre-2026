import React from 'react';

const Stewardship = () => {
    return (
        <div className="pt-40 px-8 max-w-5xl mx-auto min-h-screen">
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Our Mission</span>
                    <h1 className="text-4xl md:text-6xl font-light tracking-tight uppercase mb-8">Stewardship of the Temple</h1>
                    <p className="text-stone-500 text-sm leading-loose mb-8">
                        Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible. We believe that caring for the physical body is a spiritual act of worship and gratitude.
                    </p>
                    <p className="text-stone-500 text-sm leading-loose">
                        Our materials are ethically sourced, our production processes honor the makers, and our designs are intended to last beyond the season.
                    </p>
                </div>
                <div className="aspect-[4/5] bg-stone-100">
                    <img src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Stewardship" />
                </div>
            </div>
        </div>
    );
};

export default Stewardship;
