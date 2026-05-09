import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { getProducts, getCategories } from '../services/db';
import { ShoppingCart, ChevronDown, Star, Award, Truck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import HeroCanvas3D from './HeroCanvas3D';
import BarrelCanvas3D from './BarrelCanvas3D';
import { getProductImage, setProductImageFallback } from '../utils/productImages';

// ── Particle field component ─────────────────────────────────────────────────
function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 12 + 8}s`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Ticker items ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Vinos Selectos', 'Cervezas Premium', 'Rones Exclusivos',
  'Jamones Ibéricos', 'Quesos Artesanales', '#LaParadaObligatoria',
  'Whisky & Bourbon', 'Champagne & Espumosos', 'Embutidos Gourmet',
];

// ── About stats ──────────────────────────────────────────────────────────────
const STATS = [
  { number: '500+', label: 'Productos Premium' },
  { number: '12+', label: 'Años de Tradición' },
  { number: '99%', label: 'Clientes Satisfechos' },
  { number: '24h', label: 'Atención Personalizada' },
];

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Star,   title: 'Selección Premium',   desc: 'Curados por expertos sumillers y catadores certificados.' },
  { icon: Award,  title: 'Calidad Garantizada', desc: 'Cada producto pasa por rigurosos controles de calidad.' },
  { icon: Truck,  title: 'Entrega Express',      desc: 'Tu pedido en menos de 48 horas con temperatura controlada.' },
  { icon: Shield, title: 'Compra Segura',        desc: 'Plataforma protegida con cifrado SSL de extremo a extremo.' },
];

// ── Fallback images ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [products, setProducts]   = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter]       = useState('all');
  const [scrollY, setScrollY]     = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const addToCart = useStore(s => s.addToCart);
  const cart      = useStore(s => s.cart);
  const user      = useStore(s => s.user);
  const navigate  = useNavigate();
  const heroRef   = useRef<HTMLDivElement>(null);

  // Data
  useEffect(() => {
    getProducts().then(res => setProducts(res || []));
    getCategories().then(res => setCategories(res || []));
  }, []);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setNavScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Google login helper
  const handleLogin = useCallback(async () => {
    const { auth } = await import('../firebase');
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { console.error('Login failed:', e); }
  }, []);

  const handleLogout = useCallback(async () => {
    const { auth } = await import('../firebase');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  }, []);

  const handleAddToCart = useCallback(async (p: any) => {
    if (!user) { await handleLogin(); return; }
    addToCart({ id: p.id, name: p.name, price: p.price, quantity: 1, image: getProductImage(p) });
  }, [user, addToCart, handleLogin]);

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.categoryId === filter);

  return (
    <div style={{ background: 'var(--black)', color: 'var(--cream)', fontFamily: 'var(--font-sans)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className={`navbar ${navScrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo" aria-label="Bodegón D'Castillo Home">
          <img
            src="/logo.jpg"
            alt="D'Castillo Logo"
            onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bodegon/100'; }}
          />
        </a>

        <ul className="nav-links">
          <li><a href="#about"    className="nav-link">Nosotros</a></li>
          <li><a href="#products" className="nav-link">Catálogo</a></li>
          <li><button onClick={() => navigate('/admin')} className="nav-link" id="nav-admin-btn">Admin</button></li>

          {user ? (
            <>
              <li>
                <button onClick={() => navigate('/dashboard')} className="nav-link" id="nav-dashboard-btn">
                  Mis Pedidos
                </button>
              </li>
              <li>
                <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 600 }}>
                  {user.name}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-outline" id="nav-logout-btn" style={{ padding: '8px 20px', fontSize: '10px' }}>
                  <span>Salir</span>
                </button>
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleLogin} className="nav-cta" id="nav-login-btn">
                <span>Ingresar</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="hero-section" ref={heroRef} style={{ minHeight: '100vh' }}>
        {/* Three.js Canvas */}
        <HeroCanvas3D scrollY={scrollY} />

        {/* Particle field */}
        <ParticleField />

        {/* Radial vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'radial-gradient(ellipse 70% 80% at 30% 50%, transparent 0%, rgba(8,8,8,0.7) 100%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />

        {/* Content */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 64px', paddingTop: '90px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="hero-eyebrow">Comercializadora Premium</div>

              <h1 className="hero-title">
                Bodegón<br />
                D&rsquo;<em>Castillo</em>
              </h1>

              <span className="hero-hashtag">#LaParadaObligatoria</span>

              <p className="hero-subtitle">
                La experiencia definitiva en vinos, cervezas artesanales, 
                rones exclusivos y gastronomía gourmet. Selección curada 
                por expertos para los paladares más exigentes.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <motion.a
                  href="#products"
                  className="btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="hero-explore-btn"
                >
                  Explorar Catálogo
                  <ChevronDown size={16} />
                </motion.a>

                <motion.a
                  href="#about"
                  className="btn-outline"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="hero-about-btn"
                >
                  Nuestra Historia
                </motion.a>
              </div>
            </motion.div>

            {/* Video Card */}
            <motion.div
              className="hero-video-card"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ display: 'none' }}
              id="hero-video-card"
            >
              <video src="/brindis.mp4" autoPlay loop muted playsInline aria-hidden="true" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Hide video card on mobile, show on md+ */}
      <style>{`
        @media (min-width: 768px) { #hero-video-card { display: block !important; } }
      `}</style>

      {/* ── Ticker Bar ──────────────────────────────────────────────────────── */}
      <div className="ticker-bar" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              {item}
              <span className="ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── About Section ───────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '120px 64px', maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}
          className="about-section-grid"
        >
          <div>
            <div className="section-label">Nuestra Historia</div>
            <h2 className="section-title">
              Doce años cultivando la excelencia en cada copa
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '15px', marginBottom: '24px' }}>
              Bodegón D'Castillo nació de la pasión por llevar lo mejor del mundo
              a tu mesa. Con más de una década de experiencia, hemos construido
              relaciones directas con productores de primer nivel en todo el mundo.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '15px', marginBottom: '40px' }}>
              Cada producto en nuestro catálogo pasa por una curaduría rigurosa.
              No vendemos productos — compartimos experiencias.
            </p>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -4, borderColor: 'rgba(200,149,42,0.4)' }}
                  style={{
                    padding: '20px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={20} color="var(--gold)" style={{ marginBottom: '10px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {STATS.map(({ number, label }, i) => (
              <motion.div
                key={label}
                className="about-stat"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="stat-number">{number}</div>
                <div className="stat-label">{label}</div>
              </motion.div>
            ))}

            {/* 3D Barrel Scene */}
            <div
              style={{
                gridColumn: '1 / -1',
                height: '250px',
                position: 'relative',
                border: '1px solid var(--border-gold)',
                background: 'var(--surface-1)',
                overflow: 'hidden',
                borderRadius: '8px',
              }}
            >
              <BarrelCanvas3D />
            </div>
          </div>
        </motion.div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-section-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          #hero-section-content { padding: 0 20px !important; }
          .about-section-grid { padding: 60px 20px !important; }
        }
      `}</style>

      {/* ── Products Section ────────────────────────────────────────────────── */}
      <section id="products" style={{ padding: '80px 64px 120px', maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px' }}>
            <div className="section-label">Colección Exclusiva</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Productos<br /><em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--gold-light)' }}>Destacados</em>
              </h2>

              {/* Category filters */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  id="filter-all"
                  className={`category-pill ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Todos
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    id={`filter-${c.id}`}
                    className={`category-pill ${filter === c.id ? 'active' : ''}`}
                    onClick={() => setFilter(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🍷</div>
            {products.length === 0
              ? 'No hay productos en el catálogo aún. Usa el panel Admin para agregarlos.'
              : 'No hay productos en esta categoría.'
            }
          </div>
        ) : (
          <div className="product-grid">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="product-card"
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
                  viewport={{ once: true, margin: '-60px' }}
                  id={`product-card-${p.id}`}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: '280px' }}>
                    <img
                      src={getProductImage(p)}
                      alt={p.name}
                      className="product-card-image"
                      loading="lazy"
                      onError={e => setProductImageFallback(e.currentTarget, p.description)}
                    />
                    {/* Category badge */}
                    {p.categoryName && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(8,8,8,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border-gold)',
                        padding: '4px 12px',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--gold)',
                        zIndex: 2,
                      }}>
                        {p.categoryName}
                      </div>
                    )}
                  </div>

                  <div className="product-card-body">
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-desc">{p.description}</p>

                    <div className="product-footer">
                      <div className="product-price">${p.price}</div>
                      <motion.button
                        className="product-cart-btn"
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(p)}
                        id={`add-to-cart-${p.id}`}
                        aria-label={`Agregar ${p.name} al carrito`}
                      >
                        <ShoppingCart size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Floating Cart ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            className="floating-cart"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cart')}
            id="floating-cart-btn"
            aria-label="Ver carrito"
          >
            <ShoppingCart size={26} color="#000" />
            <motion.div
              className="cart-badge"
              key={cart.reduce((a, c) => a + c.quantity, 0)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border-gold)',
        padding: '60px 64px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '40px',
        alignItems: 'center',
      }}
        className="site-footer-grid"
      >
        <img
          src="/bodegon_logo.jpg"
          alt="Bodegón D'Castillo"
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px solid var(--border-gold)', filter: 'grayscale(60%)', transition: 'filter 0.4s ease', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%) drop-shadow(0 0 12px rgba(200,149,42,0.5))')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(60%)')}
          onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bodegon/100'; }}
        />

        <div style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Bodegón D'Castillo &nbsp;·&nbsp; Todos los derechos reservados
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#about"    style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link">Nosotros</a>
          <a href="#products" style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }} className="nav-link">Catálogo</a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .site-footer-grid { grid-template-columns: 1fr !important; text-align: center !important; justify-items: center; }
          #products { padding: 60px 20px 80px !important; }
        }
      `}</style>
    </div>
  );
}
