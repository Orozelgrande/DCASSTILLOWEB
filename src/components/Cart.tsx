import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/db';
import { ChevronLeft, Trash2, Plus, Minus, Truck, Store, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryFallbackImage, setProductImageFallback } from '../utils/productImages';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, user } = useStore();
  const navigate = useNavigate();

  // Form states
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pagomovil' | 'zelle' | 'cash'>('pagomovil');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      alert("Debes ingresar a tu cuenta para comprar.");
      return;
    }
    
    if (deliveryType === 'delivery' && !address.trim()) {
      alert("Por favor ingresa la dirección de entrega.");
      return;
    }

    if (paymentMethod === 'pagomovil' && !paymentRef.trim()) {
      alert("Por favor ingresa el número de referencia del Pago Móvil.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderDetails = {
        deliveryType,
        address: deliveryType === 'delivery' ? address : 'Retiro en tienda',
        paymentMethod,
        paymentRef: paymentMethod === 'cash' ? 'N/A' : paymentRef,
        subtotal,
        deliveryFee
      };
      await createOrder(cart, total, orderDetails);
      clearCart();
      alert('¡Pedido realizado con éxito!');
      navigate('/dashboard');
    } catch (e: any) {
      alert('Error procesando el pedido: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#080808] text-[#F2EDE4] font-sans min-h-screen pb-20">
      {/* Premium Header */}
      <div className="bg-[#121212] border-b border-white/5 pt-12 pb-8 px-6 mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8952A]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full max-w-5xl mx-auto relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#C8952A] hover:text-[#E8B84B] transition-colors mb-6 group w-fit">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Seguir Comprando</span>
          </button>
          <h1 className="font-serif text-4xl md:text-5xl text-white">Finalizar Compra</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-6">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] border border-white/5 rounded-2xl">
            <p className="text-white/40 text-xl font-serif mb-6">Tu carrito está vacío.</p>
            <button onClick={() => navigate('/')} className="bg-[#C8952A] text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#E8B84B] transition-all">
              Ir a la tienda
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Items, Delivery, Payment */}
            <div className="flex-1 space-y-10">
              
              {/* Items Section */}
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-white/40 mb-6">Tus Productos</h2>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex gap-4 items-center group hover:border-[#C8952A]/30 transition-colors">
                      <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={item.image || getCategoryFallbackImage()} alt={item.name} className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity" onError={e => setProductImageFallback(e.currentTarget)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{item.name}</h3>
                        <p className="text-[#C8952A] font-serif">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-black rounded-lg border border-white/10 px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-white/50 hover:text-white p-1">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/50 hover:text-white p-1">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 p-2 ml-2 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Delivery Section */}
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-white/40 mb-6">Método de Entrega</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      deliveryType === 'pickup' ? 'bg-[#C8952A]/10 border-[#C8952A] text-white' : 'bg-[#121212] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <Store size={28} className={deliveryType === 'pickup' ? 'text-[#C8952A]' : ''} />
                    <span className="font-bold uppercase tracking-widest text-xs">Retiro en Tienda</span>
                  </button>
                  <button 
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      deliveryType === 'delivery' ? 'bg-[#C8952A]/10 border-[#C8952A] text-white' : 'bg-[#121212] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <Truck size={28} className={deliveryType === 'delivery' ? 'text-[#C8952A]' : ''} />
                    <span className="font-bold uppercase tracking-widest text-xs">Delivery (+$5)</span>
                  </button>
                </div>
                
                <AnimatePresence>
                  {deliveryType === 'delivery' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Dirección de Entrega</label>
                        <textarea 
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="Ej: Av. Principal, Edificio Don Juan, Piso 3, Apto 3B. Referencia: Frente a la panadería."
                          className="w-full bg-black border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#C8952A] transition-colors resize-none h-28"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Payment Section */}
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-white/40 mb-6">Método de Pago</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button 
                    onClick={() => setPaymentMethod('pagomovil')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'pagomovil' ? 'bg-[#C8952A]/10 border-[#C8952A] text-white' : 'bg-[#121212] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'pagomovil' ? 'text-[#C8952A]' : ''} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Pago Móvil</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('zelle')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'zelle' ? 'bg-[#C8952A]/10 border-[#C8952A] text-white' : 'bg-[#121212] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'zelle' ? 'text-[#C8952A]' : ''} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Zelle</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'cash' ? 'bg-[#C8952A]/10 border-[#C8952A] text-white' : 'bg-[#121212] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <Banknote size={24} className={paymentMethod === 'cash' ? 'text-[#C8952A]' : ''} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Efectivo</span>
                  </button>
                </div>

                {paymentMethod === 'pagomovil' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-[#C8952A]/30 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#C8952A] uppercase tracking-widest mb-4">Datos para el pago:</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div>
                        <div className="text-white/40 text-xs uppercase mb-1">Banco</div>
                        <div className="font-medium text-white">0102 Banco de Venezuela</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs uppercase mb-1">Cédula</div>
                        <div className="font-medium text-white">V-26.563.278</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-white/40 text-xs uppercase mb-1">Teléfono</div>
                        <div className="font-medium text-white">0414-7861899</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Número de Referencia</label>
                      <input 
                        type="text" 
                        value={paymentRef}
                        onChange={e => setPaymentRef(e.target.value)}
                        placeholder="Últimos 4 o 6 dígitos"
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-[#C8952A] transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'zelle' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Datos de Zelle:</h3>
                    <div className="mb-6 text-sm">
                      <div className="text-white/40 text-xs uppercase mb-1">Email</div>
                      <div className="font-medium text-white">pagos@bodegondcastillo.com</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Nombre del titular o Referencia</label>
                      <input 
                        type="text" 
                        value={paymentRef}
                        onChange={e => setPaymentRef(e.target.value)}
                        placeholder="Ej: John Doe"
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'cash' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-center">
                    <Banknote size={32} className="mx-auto mb-3 text-white/40" />
                    <p className="text-white/60 text-sm">El pago en efectivo se realizará al momento de la entrega o retiro en tienda. Por favor tenga el monto exacto si es posible.</p>
                  </motion.div>
                )}
              </section>

            </div>

            {/* Right Column: Summary */}
            <div className="lg:w-[400px]">
              <div className="sticky top-24 bg-[#121212] border border-[#C8952A]/20 rounded-2xl p-8">
                <h2 className="font-serif text-2xl mb-6 text-white">Resumen de Compra</h2>
                
                <div className="space-y-4 mb-6 border-b border-white/5 pb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Subtotal</span>
                    <span className="font-serif text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Delivery</span>
                    <span className="font-serif text-white">{deliveryType === 'delivery' ? `$${deliveryFee.toFixed(2)}` : 'Gratis'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-bold uppercase tracking-widest text-white/60">Total a Pagar</span>
                  <span className="font-serif text-4xl text-[#C8952A]">${total.toFixed(2)}</span>
                </div>

                {!user && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-6 text-center">
                    Debes estar registrado e iniciar sesión para finalizar la compra.
                  </div>
                )}

                <button 
                  onClick={handleCheckout} 
                  disabled={isSubmitting || !user}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    isSubmitting || !user ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-[#C8952A] text-black hover:bg-[#E8B84B] shadow-[0_0_20px_rgba(200,149,42,0.3)]'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Confirmar Pedido
                    </>
                  )}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                  <CreditCard size={12} />
                  <span>Pago Seguro</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
