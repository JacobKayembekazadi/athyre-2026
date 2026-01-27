import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Menu,
    X,
    Search,
    User,
    Ticket,
    Instagram
} from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <div className="min-h-screen bg-[#FCFAF7] text-[#1C1C1C] font-sans selection:bg-[#E5D5C5] overflow-x-hidden flex flex-col">
            {/* MOBILE MENU OVERLAY */}
            <div className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-700 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-2xl font-light tracking-[0.4em] uppercase">Athyre</span>
                        <button onClick={() => setIsMenuOpen(false)}><X className="w-6 h-6" /></button>
                    </div>
                    <div className="flex flex-col gap-8 text-xl uppercase tracking-[0.2em] font-light">
                        <Link to="/shop" className="hover:text-stone-500 transition-colors">The Shop</Link>
                        <Link to="/journal" className="hover:text-stone-500 transition-colors">The Journal</Link>
                        <Link to="/stewardship" className="hover:text-stone-500 transition-colors">Stewardship</Link>
                        <Link to="/gift-cards" className="hover:text-stone-500 transition-colors">Gift Cards</Link>
                    </div>
                    <div className="mt-auto space-y-6">
                        <div className="h-px w-full bg-stone-100" />
                        <div className="flex gap-6">
                            <Link to="/account" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Account</Link>
                            <Link to="/search" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Search</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-700 px-8 py-6 flex items-center justify-between ${scrolled || location.pathname !== '/' ? 'bg-white/80 backdrop-blur-xl border-b border-stone-100 py-4 text-stone-900' : 'bg-transparent text-white'}`}>
                <div className="flex items-center gap-10">
                    <button onClick={() => setIsMenuOpen(true)} className="hover:opacity-50 transition-opacity"><Menu className="w-5 h-5" /></button>
                    <div className="hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-bold">
                        <Link to="/shop" className="hover:opacity-50 transition-opacity">The Shop</Link>
                        <div className="relative group cursor-pointer">
                            <span className="hover:opacity-50 transition-opacity flex items-center gap-1 uppercase">Discover</span>
                            <div className="absolute top-full left-0 mt-4 w-72 bg-white text-stone-900 shadow-2xl opacity-0 group-hover:opacity-100 transition-all p-8 space-y-6 pointer-events-none group-hover:pointer-events-auto border border-stone-100">
                                <div className="space-y-2">
                                    <Link to="/journal" className="block text-[11px] tracking-widest font-black uppercase hover:text-stone-500 transition-colors">The Journal</Link>
                                    <p className="text-[9px] text-stone-400 font-medium leading-relaxed tracking-wide">Recipes, fitness tips, and curated workout playlists.</p>
                                </div>
                                <div className="space-y-2">
                                    <Link to="/stewardship" className="block text-[11px] tracking-widest font-black uppercase hover:text-stone-500 transition-colors">Stewardship</Link>
                                    <p className="text-[9px] text-stone-400 font-medium leading-relaxed tracking-wide">Our commitment to creation and ethical craft.</p>
                                </div>
                                <div className="pt-4 border-t border-stone-50">
                                    <Link to="/gift-cards" className="flex items-center gap-2 text-[11px] tracking-widest font-black uppercase hover:text-stone-500 transition-colors">
                                        <Ticket className="w-3.5 h-3.5" /> Gift Cards
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-light tracking-[0.4em] uppercase">Athyre</span>
                    <span className="text-[8px] tracking-[0.6em] uppercase opacity-60 mt-1">Spirit • Soul • Body</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/search"><Search className="w-4 h-4 cursor-pointer hidden sm:block" /></Link>
                    <Link to="/account"><User className="w-4 h-4 cursor-pointer hidden sm:block" /></Link>
                    <ShoppingBag className="w-4 h-4 cursor-pointer" />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer className="bg-white pt-32 pb-12 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
                        <div className="lg:col-span-1">
                            <div className="mb-10">
                                <h3 className="text-3xl font-light tracking-[0.4em] uppercase mb-1">Athyre</h3>
                                <p className="text-[9px] tracking-[0.6em] uppercase text-stone-400 font-bold">Spirit • Soul • Body</p>
                            </div>
                            <p className="text-[11px] text-stone-400 leading-loose uppercase tracking-[0.15em] font-bold max-w-xs">
                                Designing sanctuary for the physical temple. Engineered performance for the modern steward.
                            </p>
                            <div className="flex gap-6 mt-10">
                                <Instagram className="w-5 h-5 text-stone-300 hover:text-stone-900 transition-colors cursor-pointer" />
                                <span className="text-stone-300 hover:text-stone-900 transition-colors cursor-pointer font-black text-sm">𝕏</span>
                                <span className="text-stone-300 hover:text-stone-900 transition-colors cursor-pointer font-black text-sm">f</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-stone-900">Sanctuary Shop</h4>
                            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] text-stone-500 font-bold">
                                <li><Link to="/shop" className="hover:text-stone-900 transition-colors">All Collections</Link></li>
                                <li><Link to="/shop?collection=rise" className="hover:text-stone-900 transition-colors">The Rise Drop</Link></li>
                                <li><Link to="/shop?collection=essential" className="hover:text-stone-900 transition-colors">Essential Sets</Link></li>
                                <li><Link to="/shop?collection=archives" className="hover:text-stone-900 transition-colors">Archives</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-stone-900">Growth & Wisdom</h4>
                            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] text-stone-500 font-bold">
                                <li><Link to="/journal" className="hover:text-stone-900 transition-colors">The Journal</Link></li>
                                <li><Link to="/stewardship" className="hover:text-stone-900 transition-colors">Stewardship Report</Link></li>
                                <li><Link to="/vision" className="hover:text-stone-900 transition-colors">Our Vision</Link></li>
                                <li><Link to="/gift-cards" className="hover:text-stone-900 transition-colors">Gift Cards</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-stone-900">Support Sanctuary</h4>
                            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] text-stone-500 font-bold">
                                <li><Link to="/contact" className="hover:text-stone-900 transition-colors">Contact Us</Link></li>
                                <li><Link to="/shipping" className="hover:text-stone-900 transition-colors">Shipping Rituals</Link></li>
                                <li><Link to="/returns" className="hover:text-stone-900 transition-colors">Returns & Exchange</Link></li>
                                <li><Link to="/size-guide" className="hover:text-stone-900 transition-colors">Size Guide</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase tracking-[0.3em] font-black text-stone-400">
                        <p>© 2024 Athyre Global. Honoring The Creation.</p>
                        <div className="flex gap-10">
                            <Link to="/privacy" className="cursor-pointer hover:text-stone-900">Privacy</Link>
                            <Link to="/terms" className="cursor-pointer hover:text-stone-900">Terms</Link>
                            <Link to="/accessibility" className="cursor-pointer hover:text-stone-900">Accessibility</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
