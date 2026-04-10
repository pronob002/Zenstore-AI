import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Plus, LogOut, PackageSearch, Layers, Cpu, BarChart3, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import LiveLogs from '../components/LiveLogs';
import RecentLogs from '../components/RecentLogs';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newProduct, setNewProduct] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
            }
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/logs');
            setLogs(res.data.logs);
        } catch (err) {
            console.error("Log fetch failed", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchLogs();
        const interval = setInterval(() => {
            fetchProducts();
            fetchLogs();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if(!newProduct.trim()) return;
        await api.post('/OneProductCreate', { name: newProduct });
        setNewProduct('');
        fetchProducts();
        fetchLogs();
    };

    const handleBatchUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/products/batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        fileInputRef.current.value = null;
        setIsUploading(false);
        fetchProducts();
        fetchLogs();
    };

    // --- STATISTICS & GRAPH DATA ---
    const totalProducts = products.length;
    const completedProducts = products.filter(p => p.status === 'completed').length;
    
    const categoryStats = products.reduce((acc, p) => {
        const cat = p.category || 'Processing...';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    // Convert stats object to array for the Recharts graph
    const chartData = Object.entries(categoryStats).map(([name, count]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '...' : name, // Truncate long names for chart
        count
    })).sort((a, b) => b.count - a.count); // Sort highest to lowest

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    // Make sure we don't get stuck on an empty page if items are deleted
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [products.length, currentPage, totalPages]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                <Layers size={22} />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900">
                                ZenStore
                            </span>
                        </div>
                        <button 
                            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                            <LogOut size={18} /> <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Top Row: Actions & Recent Logs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plus size={16} className="text-blue-500"/> Add Product
                            </h3>
                            <form onSubmit={handleAddProduct} className="flex flex-col gap-3 mt-auto">
                                <input 
                                    type="text" placeholder="e.g. Mechanical Keyboard" required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    value={newProduct} onChange={(e) => setNewProduct(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-semibold flex items-center justify-center gap-2">
                                    <Plus size={18} /> Add to queue
                                </button>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UploadCloud size={16} className="text-indigo-500"/> Batch CSV
                            </h3>
                            <div 
                                className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group flex flex-col items-center justify-center h-full min-h-[110px]"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <UploadCloud className="text-slate-400 group-hover:text-blue-500 transition-colors mb-2" size={28} />
                                <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 block">
                                    {isUploading ? "Uploading..." : "Select CSV File"}
                                </span>
                                <input 
                                    type="file" accept=".csv" className="hidden" 
                                    ref={fileInputRef} onChange={handleBatchUpload} disabled={isUploading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1 h-full">
                        <RecentLogs logs={logs} />
                    </div>
                </div>

                {/* Middle Row: Analytics & Visual Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stat Cards */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 flex-1">
                            <div className="bg-blue-100 p-4 rounded-full text-blue-600"><BarChart3 size={28} /></div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Products</p>
                                <h4 className="text-3xl font-bold text-slate-800">{totalProducts}</h4>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 flex-1">
                            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><CheckCircle2 size={28} /></div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">AI Completed</p>
                                <h4 className="text-3xl font-bold text-slate-800">{completedProducts}</h4>
                            </div>
                        </div>
                    </div>
                    
                    {/* Visual Category Graph */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                        <p className="text-sm text-slate-500 font-bold mb-4 uppercase tracking-wider">Category Distribution</p>
                        <div className="h-48 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            cursor={{fill: '#f1f5f9'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.name === 'Processing...' ? '#fbbf24' : '#3b82f6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 italic">No data to display</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: The Table with Pagination */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <PackageSearch size={20} className="text-slate-500" />
                            <h2 className="text-lg font-bold text-slate-800">Product Database</h2>
                        </div>
                        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            {totalProducts} Items
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold w-1/4">Name & Category</th>
                                    <th className="px-6 py-4 font-semibold w-2/4">Generated Description</th>
                                    <th className="px-6 py-4 font-semibold text-right w-1/4">Processing Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                            <div className="text-xs font-semibold text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100">
                                                {p.category || 'Pending...'}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-sm text-slate-700 align-top">
                                            <p className="leading-relaxed whitespace-pre-wrap">
                                                {p.description || (
                                                    <span className="text-slate-400 italic flex items-center gap-2">
                                                        <Cpu size={14} className="animate-pulse" /> Processing AI data...
                                                    </span>
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4 align-top text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                                p.status === 'completed' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-amber-100 text-amber-700 animate-pulse'
                                            }`}>
                                                {p.status === 'completed' ? (
                                                    <><CheckCircle2 size={14}/> COMPLETED</>
                                                ) : (
                                                    <><Clock size={14}/> PROCESSING</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {currentProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16">
                                            <p className="text-slate-500 text-sm">No products found. Upload a CSV to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 1 ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                <ChevronLeft size={16}/> Previous
                            </button>
                            
                            <span className="text-sm font-medium text-slate-500">
                                Page <span className="font-bold text-slate-800">{currentPage}</span> of {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === totalPages ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                Next <ChevronRight size={16}/>
                            </button>
                        </div>
                    )}
                </div>

                {/* Raw Terminal */}
                <div className="mt-8">
                    <LiveLogs logs={logs} />
                </div>
            </main>
        </div>
    );
}