import React from 'react';
import { Link } from 'react-router-dom';

const products = [
    { id: 1, name: "Sabbath Ribbed Legging", price: "$128", tag: "The Core Piece", image: "/images/product-1.jpg", hoverImage: "/images/product-1.jpg" },
    { id: 2, name: "Grace-Float Sports Bra", price: "$74", tag: "Ethereal Support", image: "/images/product-2.jpg", hoverImage: "/images/product-2.jpg" },
    { id: 3, name: "Sanctuary Oversized Zip", price: "$165", tag: "Pre-order", image: "/images/product-3.jpg", hoverImage: "/images/product-3.jpg" },
    { id: 4, name: "Elysian Biker Short", price: "$68", tag: "New", image: "/images/product-4.jpg", hoverImage: "/images/product-4.jpg" }
];

const Shop = () => {
    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
                <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">The Collection</span>
                <h2 className="text-4xl md:text-5xl font-light tracking-tight uppercase">All Products</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {products.map((product) => (
                    <div key={product.id} className="group">
                        <Link to={`/product/${product.id}`} className="block">
                            <div className="relative aspect-[3/4] overflow-hidden bg-stone-50 mb-6 rounded-[2px]">
                                <img src={product.image} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-105" alt={product.name} />
                                <img src={product.hoverImage} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-1000 group-hover:opacity-100" alt={`${product.name} detail`} />
                                <button className="absolute bottom-6 left-6 right-6 bg-stone-900 text-white py-4 text-[9px] uppercase tracking-[0.3em] font-black translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                                    View Details — {product.price}
                                </button>
                            </div>
                            <h3 className="text-[12px] font-bold tracking-widest uppercase mb-1">{product.name}</h3>
                            <p className="text-stone-400 text-[11px] uppercase tracking-wider">{product.price}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
