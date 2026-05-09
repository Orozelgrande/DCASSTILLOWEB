import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { getUserOrders } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, ChevronLeft, User, Mail, Hash, Calendar, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    getUserOrders(user.uid).then(res => {
      setOrders(res || []);
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="bg-[#080808] text-[#F2EDE4] font-sans min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C8952A] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-48 w-80 h-80 bg-[#C8952A] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[#C8952A] hover:text-[#E8B84B] transition-colors mb-12 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a la tienda</span>
        </motion.button>
        
        {/* Header Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-white/5 rounded-2xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start"
        >
          <div className="w-24 h-24 bg-[#C8952A]/10 rounded-full flex items-center justify-center border border-[#C8952A]/30">
            <User size={48} className="text-[#C8952A]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-4xl md:text-5xl mb-2 text-white">Panel de Cliente</h1>
            <div className="flex flex-col md:flex-row gap-4 mt-4 text-white/60">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={16} className="text-[#C8952A]" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <User size={16} className="text-[#C8952A]" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#C8952A]/5 border border-[#C8952A]/20 px-6 py-4 rounded-xl text-center">
            <div className="text-xs uppercase tracking-widest text-[#C8952A] font-bold mb-1">Pedidos Realizados</div>
            <div className="text-3xl font-serif text-white">{orders.length}</div>
          </div>
          
          <button 
            onClick={() => {
              import('firebase/auth').then(({ signOut }) => {
                import('../firebase').then(({ auth }) => {
                  signOut(auth).then(() => navigate('/'));
                });
              });
            }}
            className="md:ml-4 flex items-center justify-center p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors gap-2"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Salir</span>
          </button>
        </motion.div>

        <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
          <Package className="text-[#C8952A]" />
          Mis Pedidos
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <div className="w-12 h-12 border-2 border-[#C8952A] border-t-transparent rounded-full animate-spin" />
            <p className="font-medium tracking-widest uppercase text-xs">Cargando tus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-20 text-center">
            <Package size={48} className="mx-auto mb-6 opacity-20" />
            <p className="text-white/40 text-lg mb-8">Aún no has realizado ningún pedido.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#C8952A] text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#E8B84B] transition-all"
            >
              Comenzar a comprar
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((o, index) => (
              <motion.div 
                key={o.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#121212] border border-white/5 hover:border-[#C8952A]/30 rounded-2xl overflow-hidden transition-all duration-500"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Hash size={14} className="text-[#C8952A]" />
                        <span className="text-xs font-mono uppercase tracking-tighter">ID: {o.id.substring(0, 12)}...</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar size={16} className="text-[#C8952A]" />
                        <span className="text-sm font-medium">
                          {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('es-ES', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          }) : 'Reciente'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm uppercase tracking-widest text-white/40 font-bold mb-1">Total</div>
                        <div className="text-3xl font-serif text-[#C8952A]">${o.total}</div>
                      </div>
                      <div className="h-12 w-[1px] bg-white/5 hidden md:block" />
                      <div className={`px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center gap-2 ${
                        o.status === 'completed' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-[#C8952A]/10 text-[#C8952A] border border-[#C8952A]/20'
                      }`}>
                        {o.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {o.status === 'pending' ? 'Pendiente' : o.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#C8952A] mb-4">Productos</h4>
                      <div className="space-y-4">
                        {o.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center group/item">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold text-[#C8952A]">
                                {item.quantity}x
                              </div>
                              <span className="text-sm text-white/80 group-hover/item:text-white transition-colors">{item.name}</span>
                            </div>
                            <span className="text-sm text-white/40 font-serif">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.02] rounded-xl p-6 border border-white/5">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#C8952A] mb-4">Detalles del Pedido</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Subtotal</span>
                          <span className="text-white/80 font-serif">${o.total}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Entrega</span>
                          <span className="text-green-500 font-bold uppercase tracking-widest">Gratis</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          <span className="text-sm font-bold text-white uppercase tracking-widest">Pago Realizado</span>
                          <span className="text-lg font-serif text-[#C8952A]">${o.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
