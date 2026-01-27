import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const products = [
    { id: 1, name: "Sabbath Ribbed Legging", price: "$128", tag: "The Core Piece", description: "Designed for the deepest stretches and the longest days. Our signature ribbed fabric hugs your form while offering breathable support.", image: "/images/product-1.jpg" },
    { id: 2, name: "Grace-Float Sports Bra", price: "$74", tag: "Ethereal Support", description: "Minimalist support for maximum freedom. The Grace-Float bra feels like a second skin, perfect for low-impact movement and meditation.", image: "/images/product-2.jpg" },
    { id: 3, name: "Sanctuary Oversized Zip", price: "$165", tag: "Pre-order", description: "Wrap yourself in comfort. The Sanctuary Zip is oversized by design, creating a private haven of warmth wherever you go.", image: "/images/product-3.jpg" },
    { id: 4, name: "Elysian Biker Short", price: "$68", tag: "New", description: "Freedom of movement in a shorter silhouette. The Elysian Biker Short combines our performance fabric with a liberating cut.", image: "/images/product-4.jpg" }
];

const ProductDetail = () => {
    const { id } = useParams();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-xl uppercase tracking-widest text-stone-400">Product not found</div>;
    }

    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">
            <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-stone-900 mb-12 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Link>
            <div className="grid md:grid-cols-2 gap-16">
                <div className="aspect-[3/4] bg-stone-50 overflow-hidden rounded-[2px]">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">{product.tag}</span>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-6">{product.name}</h1>
                    <p className="text-xl font-serif italic text-stone-600 mb-8">{product.price}</p>
                    <p className="text-stone-500 text-sm leading-loose mb-12 max-w-md">{product.description}</p>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                <button key={size} className="w-12 h-12 border border-stone-200 text-[10px] font-bold hover:border-stone-900 transition-colors">{size}</button>
                            ))}
                        </div>
                        <button className="w-full bg-stone-900 text-white py-5 text-[10px] tracking-[0.3em] font-black uppercase hover:bg-stone-800 transition-colors shadow-lg">
                            Add to Sanctuary
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
