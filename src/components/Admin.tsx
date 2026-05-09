import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getProducts, getCategories, addCategory, addProduct, updateProduct, deleteProduct, deleteCategory, getAllOrders, updateOrderStatus, getUsers, deleteOrder } from '../services/db';
import { syncUser } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { Package, Grid, ShoppingBag, Users, BarChart3, Trash2, Plus, Edit2, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductImage, setProductImageFallback } from '../utils/productImages';

export default function Admin() {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('metrics');
  const [searchTerm, setSearchTerm] = useState('');

  // Forms state
  const [newProd, setNewProd] = useState({ name: '', description: '', price: 0, categoryId: '', photoUrl: '', videoUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: '' });

  const loadData = async () => {
    if (user?.isAdmin) {
      setProducts(await getProducts() || []);
      setCategories(await getCategories() || []);
      setOrders(await getAllOrders() || []);
      setCustomers(await getUsers() || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const [credentials, setCredentials] = useState({ user: '', pass: '' });

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      const synced = await syncUser(res.user);
      setUser(synced as any);
    } catch(e: any) {
      alert("Error Google Login: " + e.message);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.user || !credentials.pass) return alert("Completa los campos");

    if (credentials.user === 'admin' && credentials.pass === 'admin') {
      setUser({ uid: 'mock-admin', email: 'admin@bodegon.com', name: 'Admin Demo', isAdmin: true });
      return;
    }

    let email = credentials.user;
    if (credentials.user.toLowerCase() === 'admin') email = 'admin@bodegon.com';
    let pass = credentials.pass;
    if (pass === 'admin') pass = 'admin123';

    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const synced = await syncUser(res.user);
      setUser(synced as any);
    } catch(e: any) {
      if (e.code === 'auth/operation-not-allowed') {
        alert("Habilita Correo/Contraseña en Firebase.");
        return;
      }
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const synced = await syncUser(res.user);
        setUser(synced as any);
      } catch (createErr: any) {
        alert("Credenciales inválidas.");
      }
    }
  };

  const handleAddProd = async () => {
    if(!newProd.name || !newProd.categoryId) return alert('Name and Category are required');
    const prodToSave = {
      name: newProd.name,
      description: newProd.description,
      price: Number(newProd.price),
      categoryId: newProd.categoryId,
      images: newProd.photoUrl ? [newProd.photoUrl] : [getProductImage({ name: newProd.name, description: newProd.description, images: [] })],
      videos: newProd.videoUrl ? [newProd.videoUrl] : []
    };

    if (editingId) {
      await updateProduct(editingId, prodToSave);
      setEditingId(null);
    } else {
      const id = Math.random().toString(36).substring(7);
      await addProduct(id, prodToSave);
    }
    setNewProd({ name: '', description: '', price: 0, categoryId: '', photoUrl: '', videoUrl: '' });
    loadData();
  };

  const editProduct = (p: any) => {
    setEditingId(p.id);
    setNewProd({
      name: p.name,
      description: p.description || '',
      price: p.price || 0,
      categoryId: p.categoryId || '',
      photoUrl: getProductImage(p),
      videoUrl: p.videos?.[0] || ''
    });
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCat = async () => {
    if(!newCat.name) return alert('Name is required');
    const id = Math.random().toString(36).substring(7);
    await addCategory(id, newCat.name, newCat.description, newCat.icon);
    setNewCat({ name: '', description: '', icon: '' });
    loadData();
  };

  const handleDeleteProd = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta categoría?")) {
      await deleteCategory(id);
      loadData();
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    loadData();
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("¿Eliminar este pedido cancelado permanentemente?")) {
      await deleteOrder(id);
      loadData();
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm("¿Rellenar datos iniciales? Se agregarán categorías y productos automáticamente.")) return;
    const cats = [
      { id: 'cat-rones', name: 'Rones', description: 'El orgullo nacional', icon: '🥃' },
      { id: 'cat-cervezas', name: 'Cervezas', description: 'Industriales y Artesanales', icon: '🍺' },
      { id: 'cat-whisky', name: 'Whisky', description: 'Scotch Blended Whisky', icon: '🥃' }
    ];
    for (let c of cats) await addCategory(c.id, c.name, c.description, c.icon);
    loadData();
    alert("Proceso de categorías finalizado.");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10 font-sans">
        <h1 className="font-serif text-5xl mb-6">Panel Administrativo</h1>
        <form onSubmit={handleManualLogin} className="flex flex-col w-full max-w-sm mb-8 bg-[#121212] p-8 border border-white/10 rounded-2xl">
          <input 
            type="text" placeholder="Usuario" value={credentials.user} onChange={e => setCredentials({...credentials, user: e.target.value})}
            className="w-full bg-black border border-white/10 p-3 mb-4 rounded-xl text-white outline-none focus:border-[#C8952A]" 
          />
          <input 
            type="password" placeholder="Contraseña" value={credentials.pass} onChange={e => setCredentials({...credentials, pass: e.target.value})}
            className="w-full bg-black border border-white/10 p-3 mb-6 rounded-xl text-white outline-none focus:border-[#C8952A]" 
          />
          <button type="submit" className="bg-[#C8952A] text-black px-8 py-3 rounded-xl font-bold uppercase hover:bg-[#E8B84B] transition">Ingresar</button>
        </form>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white p-10 text-center flex flex-col items-center justify-center">
        <h1 className="font-serif text-3xl mb-4">Acceso Denegado</h1>
        <button onClick={() => navigate('/')} className="text-[#C8952A] hover:underline">Volver a la Tienda</button>
      </div>
    );
  }

  // Calculate Metrics
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const totalSalesCount = completedOrders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const canceledOrders = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F2EDE4] font-sans pb-20">
      
      {/* Header */}
      <div className="bg-[#121212] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl text-white">Panel Administrativo</h1>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Bodegón D'Castillo</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSeedData} className="px-4 py-2 bg-white/5 text-white/60 hover:text-white rounded-lg text-sm transition-colors border border-white/5">
              Generar Catálogo Base
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-[#C8952A]/10 text-[#C8952A] hover:bg-[#C8952A]/20 rounded-lg text-sm font-bold transition-colors border border-[#C8952A]/20">
              Ir a la Tienda
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto">
          {[
            { id: 'metrics', label: 'Métricas', icon: <BarChart3 size={16}/> },
            { id: 'orders', label: 'Pedidos', icon: <ShoppingBag size={16}/> },
            { id: 'products', label: 'Productos', icon: <Package size={16}/> },
            { id: 'categories', label: 'Categorías', icon: <Grid size={16}/> },
            { id: 'customers', label: 'Clientes', icon: <Users size={16}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`py-4 flex items-center gap-2 border-b-2 font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-[#C8952A] text-[#C8952A]' : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'orders' && pendingOrders > 0 && (
                <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-[10px] ml-1">{pendingOrders}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* METRICS DASHBOARD */}
        {activeTab === 'metrics' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><DollarSign size={80}/></div>
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Ingresos Totales</h3>
                <div className="text-4xl font-serif text-[#C8952A]">${totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><Activity size={80}/></div>
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Ventas Concretadas</h3>
                <div className="text-4xl font-serif text-white">{totalSalesCount}</div>
              </div>
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><Clock size={80}/></div>
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Pedidos Pendientes</h3>
                <div className="text-4xl font-serif text-yellow-500">{pendingOrders}</div>
              </div>
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><Users size={80}/></div>
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Clientes Registrados</h3>
                <div className="text-4xl font-serif text-blue-400">{customers.length}</div>
              </div>
            </div>

            {/* Visual Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#121212] p-8 rounded-2xl border border-white/5">
                <h3 className="text-white text-lg font-serif mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-[#C8952A]"/> Rendimiento por Estado</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase text-white/60 mb-2">
                      <span>Completados ({totalSalesCount})</span>
                      <span>{orders.length > 0 ? Math.round((totalSalesCount/orders.length)*100) : 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{width: `${orders.length > 0 ? (totalSalesCount/orders.length)*100 : 0}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase text-white/60 mb-2">
                      <span>Pendientes ({pendingOrders})</span>
                      <span>{orders.length > 0 ? Math.round((pendingOrders/orders.length)*100) : 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{width: `${orders.length > 0 ? (pendingOrders/orders.length)*100 : 0}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase text-white/60 mb-2">
                      <span>Cancelados ({canceledOrders})</span>
                      <span>{orders.length > 0 ? Math.round((canceledOrders/orders.length)*100) : 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{width: `${orders.length > 0 ? (canceledOrders/orders.length)*100 : 0}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#121212] p-8 rounded-2xl border border-white/5">
                 <h3 className="text-white text-lg font-serif mb-6 flex items-center gap-2"><ShoppingBag size={20} className="text-[#C8952A]"/> Últimas Ventas</h3>
                 <div className="space-y-4">
                   {completedOrders.slice(0, 5).map(o => (
                     <div key={o.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                       <div>
                         <div className="text-sm font-bold text-white">{o.id.substring(0,8).toUpperCase()}</div>
                         <div className="text-xs text-white/40">{new Date(o.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                       </div>
                       <div className="text-[#C8952A] font-serif font-bold">+${o.total.toFixed(2)}</div>
                     </div>
                   ))}
                   {completedOrders.length === 0 && <div className="text-white/40 text-sm italic">No hay ventas registradas.</div>}
                 </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ORDERS SECTION */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
               Gestión de Pedidos
            </h2>
            <div className="grid gap-4">
              {orders.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(o => (
                <div key={o.id} className="bg-[#121212] p-6 rounded-2xl border border-white/5 flex flex-col lg:flex-row justify-between gap-6 hover:border-[#C8952A]/30 transition-colors">
                   
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                       <span className="font-mono text-xs text-[#C8952A] bg-[#C8952A]/10 px-2 py-1 rounded">ID: {o.id}</span>
                       <span className="text-white/40 text-xs">{new Date(o.createdAt?.seconds * 1000).toLocaleString()}</span>
                     </div>
                     
                     <div className="grid lg:grid-cols-2 gap-4 mt-4">
                       <div>
                         <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Cliente & Entrega</h4>
                         <div className="text-sm text-white/80">{customers.find(c => c.uid === o.userId)?.name || 'Usuario'} ({customers.find(c => c.uid === o.userId)?.email})</div>
                         <div className="text-xs text-white/60 mt-1 capitalize">{o.deliveryType === 'delivery' ? `Delivery: ${o.address}` : 'Retiro en Tienda'}</div>
                       </div>
                       <div>
                         <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Pago & Productos</h4>
                         <div className="text-sm text-white/80 capitalize">{o.paymentMethod || 'No especificado'} {o.paymentRef && o.paymentRef !== 'N/A' && `(Ref: ${o.paymentRef})`}</div>
                         <div className="text-xs text-[#C8952A] mt-1">{o.items?.map((i:any) => `${i.quantity}x ${i.name}`).join(', ')}</div>
                       </div>
                     </div>
                   </div>

                   <div className="flex flex-col items-end justify-between min-w-[200px] border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                      <div className="text-3xl font-serif text-white mb-4">${o.total.toFixed(2)}</div>
                      
                      <div className="w-full space-y-2">
                        <select 
                          value={o.status} 
                          onChange={e => handleUpdateOrderStatus(o.id, e.target.value)} 
                          className={`w-full p-2 rounded-lg text-sm font-bold uppercase tracking-widest outline-none border transition-colors ${
                            o.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                            o.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                          }`}
                        >
                          <option value="pending" className="bg-[#121212] text-white">Pendiente</option>
                          <option value="completed" className="bg-[#121212] text-white">Completado</option>
                          <option value="cancelled" className="bg-[#121212] text-white">Cancelado</option>
                        </select>
                        
                        {o.status === 'cancelled' && (
                          <button onClick={() => handleDeleteOrder(o.id)} className="w-full py-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} /> Eliminar Registro
                          </button>
                        )}
                      </div>
                   </div>

                </div>
              ))}
              {orders.length === 0 && <div className="text-center py-20 text-white/40 border border-white/5 rounded-2xl">No hay pedidos registrados.</div>}
            </div>
          </motion.div>
        )}

        {/* PRODUCTS SECTION */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 sticky top-24">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                  {editingId ? <Edit2 size={20} className="text-[#C8952A]"/> : <Plus size={20} className="text-[#C8952A]"/>}
                  {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Nombre del producto" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none transition-colors" />
                  <textarea placeholder="Descripción" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none transition-colors resize-none h-24" />
                  <div className="flex gap-4">
                    <input type="number" placeholder="Precio ($)" value={newProd.price} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} className="w-1/2 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none transition-colors" />
                    <select value={newProd.categoryId} onChange={e => setNewProd({...newProd, categoryId: e.target.value})} className="w-1/2 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none transition-colors">
                      <option value="">Categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <input type="text" placeholder="URL de la Imagen" value={newProd.photoUrl} onChange={e => setNewProd({...newProd, photoUrl: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none transition-colors" />
                  
                  <div className="pt-4 flex gap-4">
                    <button onClick={handleAddProd} className="flex-1 bg-[#C8952A] text-black py-3 rounded-xl uppercase font-bold text-xs tracking-widest hover:bg-[#E8B84B] transition-colors shadow-[0_0_15px_rgba(200,149,42,0.2)]">
                      {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                    {editingId && (
                      <button onClick={() => { setEditingId(null); setNewProd({ name: '', description: '', price: 0, categoryId: '', photoUrl: '', videoUrl: '' }) }} className="px-4 border border-white/20 text-white rounded-xl uppercase font-bold text-xs tracking-widest hover:bg-white/5 transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="xl:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">Inventario ({products.length})</h2>
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-[#121212] border border-white/10 rounded-xl p-2 px-4 text-sm text-white w-64 focus:border-[#C8952A] outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-[#C8952A]/30 transition-all">
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity" onError={e => setProductImageFallback(e.currentTarget, p.description)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{p.name}</div>
                      <div className="text-xs text-white/40 mb-1">{categories.find(c => c.id === p.categoryId)?.name || 'Sin Categoría'}</div>
                      <div className="text-md text-[#C8952A] font-serif">${p.price}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => editProduct(p)} className="p-2 bg-white/5 hover:bg-[#C8952A]/20 text-white hover:text-[#C8952A] rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteProd(p.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CATEGORIES SECTION */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-fit">
              <h2 className="text-xl font-serif mb-6 flex items-center gap-2"><Plus size={20} className="text-[#C8952A]"/> Nueva Categoría</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nombre" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none" />
                <input type="text" placeholder="Descripción" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none" />
                <input type="text" placeholder="Icono (emoji)" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-[#C8952A] outline-none" />
                <button onClick={handleAddCat} className="bg-[#C8952A] text-black w-full py-3 rounded-xl uppercase font-bold text-xs tracking-widest hover:bg-[#E8B84B]">Guardar Categoría</button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif mb-6">Lista de Categorías</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-[#121212] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-2xl border border-white/5">{c.icon}</div>
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-xs text-white/40">{c.description}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCat(c.id)} className="text-white/20 hover:text-red-500 p-2 transition-colors"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CUSTOMERS SECTION */}
        {activeTab === 'customers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-2xl font-serif mb-6">Clientes Registrados ({customers.length})</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {customers.map(c => {
                 const customerOrders = orders.filter(o => o.userId === c.uid);
                 const totalSpent = customerOrders.filter(o=>o.status==='completed').reduce((sum, o) => sum + o.total, 0);
                 return (
                   <div key={c.uid} className="bg-[#121212] p-6 rounded-2xl border border-white/5 flex flex-col">
                     <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-[#C8952A]/10 border border-[#C8952A]/30 rounded-full flex items-center justify-center text-[#C8952A] text-xl font-bold font-serif">
                         {c.name?.charAt(0).toUpperCase() || c.email?.charAt(0).toUpperCase() || 'U'}
                       </div>
                       <div>
                         <div className="font-bold text-white truncate max-w-[200px]">{c.name || 'Sin Nombre'}</div>
                         <div className="text-xs text-white/40 truncate max-w-[200px]">{c.email}</div>
                         {c.isAdmin && <span className="inline-block px-2 py-0.5 bg-[#C8952A] text-black text-[10px] font-black uppercase mt-1 rounded">Admin</span>}
                       </div>
                     </div>
                     
                     <div className="bg-black/50 rounded-xl p-4 border border-white/5 mt-auto">
                       <div className="flex justify-between items-center mb-2 text-sm">
                         <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Pedidos</span>
                         <span className="font-bold text-white">{customerOrders.length}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Inversión</span>
                         <span className="text-[#C8952A] font-serif font-bold">${totalSpent.toFixed(2)}</span>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
