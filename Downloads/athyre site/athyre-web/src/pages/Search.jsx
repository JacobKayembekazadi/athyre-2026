import React, { useState } from 'react';
import { Search as SearchIcon, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Search = () => {
    const [query, setQuery] = useState('');

    // Simulate dynamic results
    const allProducts = [
        { id: 1, name: "Sabbath Ribbed Legging", price: "$128", image: "/images/product-1.jpg" },
        { id: 2, name: "Grace-Float Sports Bra", price: "$74", image: "/images/product-2.jpg" },
        { id: 3, name: "Sanctuary Oversized Zip", price: "$165", image: "/images/product-3.jpg" },
        { id: 4, name: "Elysian Biker Short", price: "$68", image: "/images/product-4.jpg" }
    ];

    const results = query ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : [];

    return (
        <div className="pt-32 min-h-screen flex flex-col">

            {/* SECTION 1: SEARCH INPUT - Full Screen Focus */}
            <section className="px-8 max-w-5xl mx-auto w-full mb-20">
                <div className="relative border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors">
                    <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="WHAT ARE YOU SEEKING?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent py-6 pl-12 text-2xl md:text-4xl font-light uppercase tracking-widest placeholder:text-stone-300 focus:outline-none text-stone-900"
                    />
                </div>
            </section>

            {query ? (
                /* SECTION 4: RESULTS GRID (Conditional) */
                <section className="px-8 max-w-7xl mx-auto w-full flex-grow">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-12">Search Results ({results.length})</span>
                    {results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {results.map(product => (
                                <Link key={product.id} to={`/product/${product.id}`} className="group">
                                    <div className="aspect-[3/4] bg-stone-50 mb-4 overflow-hidden rounded-[2px]">
                                        <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
                                    </div>
                                    <h3 className="text-[10px] font-bold tracking-widest uppercase">{product.name}</h3>
                                    <p className="text-stone-400 text-[10px]">{product.price}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-stone-400 text-sm uppercase tracking-widest">No sanctuary found for this term.</div>
                    )}
                </section>
            ) : (
                <>
                    {/* SECTION 2: TRENDING - Rising Now */}
                    <section className="px-8 max-w-7xl mx-auto w-full mb-32">
                        <div className="flex items-center gap-2 mb-8 text-stone-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Rising Now</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {['Oversized Web', 'Ribbed Leggings', 'Yoga Mats', 'Gift Cards', 'Essential Crew'].map((term) => (
                                <button key={term} onClick={() => setQuery(term)} className="px-8 py-3 border border-stone-200 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all">
                                    {term}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 3: CATEGORIES - Visual Blocks */}
                    <section className="flex-grow bg-stone-50 py-24 border-t border-stone-100">
                        <div className="px-8 max-w-7xl mx-auto w-full">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-12">Browse by Category</span>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { name: "Bottoms", img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800" },
                                    { name: "Tops & Bras", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800" },
                                    { name: "Outerwear", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" }
                                ].map((cat) => (
                                    <Link to="/shop" key={cat.name} className="group relative aspect-video overflow-hidden">
                                        <img src={cat.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={cat.name} />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <span className="text-white text-xl font-light tracking-[0.3em] uppercase group-hover:underline underline-offset-8 decoration-1">{cat.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Search;
