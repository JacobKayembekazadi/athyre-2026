import React, { useState } from 'react';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">

            {/* SECTION 1: HEADER & NAV */}
            <div className="grid lg:grid-cols-4 gap-12 mb-20">
                <div className="lg:col-span-1">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black">Welcome Back</h2>
                            <span className="text-xl font-serif italic text-stone-600">Jacob</span>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <User className="w-4 h-4" /> },
                            { id: 'orders', label: 'Order History', icon: <Package className="w-4 h-4" /> },
                            { id: 'addresses', label: 'Sanctuary Addresses', icon: <MapPin className="w-4 h-4" /> },
                            { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-50 hover:text-stone-900'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                        <button className="w-full flex items-center gap-4 p-4 text-[10px] uppercase tracking-[0.2em] font-bold text-red-300 hover:bg-red-50 hover:text-red-500 transition-all mt-8">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </nav>
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-3 min-h-[500px]">

                    {/* SECTION 2: DASHBOARD VIEW */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-stone-50 p-12 relative overflow-hidden rounded-[2px]">
                                <h3 className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-black mb-6">Your Daily Intention</h3>
                                <p className="text-3xl font-serif italic text-stone-800 leading-relaxed max-w-lg">
                                    "Discipline is the highest form of self-love. Honor the temple today."
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="border border-stone-200 p-8 text-center">
                                    <span className="block text-4xl font-light mb-2">0</span>
                                    <span className="text-[9px] uppercase tracking-widest text-stone-400">Active Orders</span>
                                </div>
                                <div className="border border-stone-200 p-8 text-center">
                                    <span className="block text-4xl font-light mb-2">126</span>
                                    <span className="text-[9px] uppercase tracking-widest text-stone-400">Reward Points</span>
                                </div>
                                <div className="border border-stone-200 p-8 text-center">
                                    <span className="block text-4xl font-light mb-2">$0.00</span>
                                    <span className="text-[9px] uppercase tracking-widest text-stone-400">Store Credit</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: ORDERS VIEW (Placeholder Data) */}
                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-serif italic mb-8">Recent Orders</h2>
                            <div className="text-center py-20 border-2 border-dashed border-stone-100">
                                <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                                <p className="text-stone-400 text-sm mb-6">No orders found yet.</p>
                                <Link to="/shop" className="bg-stone-900 text-white px-8 py-3 text-[9px] uppercase tracking-widest font-black inline-block">Start Your Collection</Link>
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: WISHLIST VIEW (Visual Grid) */}
                    {activeTab === 'wishlist' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-serif italic mb-8">Saved for Later</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {[1, 2].map((item) => (
                                    <div key={item} className="group relative">
                                        <div className="aspect-[3/4] bg-stone-100 mb-4 overflow-hidden">
                                            <img src={`/images/product-${item}.jpg`} className="w-full h-full object-cover grayscale opacity-60" alt="Saved Item" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[10px] uppercase font-bold tracking-widest">Saved Item {item}</h3>
                                            <button className="text-stone-400 hover:text-red-500 transition-colors"><Heart className="w-4 h-4 fill-current" /></button>
                                        </div>
                                        <button className="w-full mt-4 border border-stone-200 py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-stone-900 hover:text-white transition-colors">Add to Bag</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-serif italic mb-8">Saved Addresses</h2>
                            <div className="border border-stone-200 p-8 flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold block mb-2">Default Sanctuary</span>
                                    <p className="text-sm text-stone-500 leading-relaxed">
                                        Jacob User<br />
                                        1234 Temple Way<br />
                                        Los Angeles, CA 90012<br />
                                        United States
                                    </p>
                                </div>
                                <button className="text-[9px] uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-1 hover:text-stone-900 hover:border-stone-900">Edit</button>
                            </div>
                            <button className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 group">
                                <Plus className="w-4 h-4 border border-stone-300 rounded-full p-0.5 group-hover:border-stone-900" /> Add New Address
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Account;
