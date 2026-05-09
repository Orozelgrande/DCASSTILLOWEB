import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Cart from './components/Cart';
import Admin from './components/Admin';
import Dashboard from './components/Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useStore } from './store';
import { syncUser } from './services/db';
import { motion, AnimatePresence } from 'motion/react';

function AgeVerification({ onVerify }: { onVerify: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#141414] border border-[#C8952A]/30 p-10 max-w-lg w-full text-center rounded-sm"
      >
        <img src="/logo.jpg" alt="Logo" className="w-24 h-24 mx-auto mb-8 rounded-full border-2 border-[#C8952A]" onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bodegon/100'; 
        }} />
        <h2 className="font-serif text-3xl text-white mb-4">¿Eres mayor de 18 años?</h2>
        <p className="text-white/60 mb-10 text-sm">Debes tener al menos 18 años para ingresar a este sitio. Al hacer clic en "Sí", confirmas que tienes edad legal para consumir bebidas alcohólicas.</p>
        
        <div className="flex gap-4 justify-center">
          <button onClick={onVerify} className="px-8 py-3 bg-[#C8952A] text-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300">
            Sí, tengo 18+
          </button>
          <button onClick={() => window.location.href = 'https://google.com'} className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
            No, soy menor
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const { setUser, setAuthLoaded } = useStore();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setIsVerified(true);
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const syncedUser = await syncUser(user);
        setUser(syncedUser as any);
      } else {
        setUser(null);
      }
      setAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleVerify = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVerified(true);
  };

  return (
    <>
      <AnimatePresence>
        {!isVerified && <AgeVerification onVerify={handleVerify} />}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
