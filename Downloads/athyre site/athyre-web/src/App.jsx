import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Journal from './pages/Journal';
import Stewardship from './pages/Stewardship';
import GiftCards from './pages/GiftCards';
import Search from './pages/Search';
import SizeGuide from './pages/SizeGuide';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Vision from './pages/Vision';
import { Privacy, Terms, Accessibility } from './pages/Legal';
import Account from './pages/Account';

const App = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="journal" element={<Journal />} />
        <Route path="stewardship" element={<Stewardship />} />
        <Route path="gift-cards" element={<GiftCards />} />
        <Route path="search" element={<Search />} />
        <Route path="size-guide" element={<SizeGuide />} />
        <Route path="contact" element={<Contact />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="returns" element={<Returns />} />
        <Route path="vision" element={<Vision />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="account" element={<Account />} />
        {/* Fallback for unbuilt pages to avoid broken links during dev */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
