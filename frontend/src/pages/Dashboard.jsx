import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Plus, LogOut, PackageSearch, Layers, Cpu } from 'lucide-react';
import api from '../services/api';
import LiveLogs from '../components/LiveLogs';
import RecentLogs from '../components/RecentLogs';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newProduct, setNewProduct] = useState('');
    const [isUploading, setIsUploading] = useState(false);
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
        await api.post('/products', { name: newProduct });
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plus size={16} className="text-blue-500"/> Add Product
                            </h3>
                            <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
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
                                className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group flex flex-col items-center justify-center h-full"
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

                    <div className="md:col-span-1">
                        <RecentLogs logs={logs} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <PackageSearch size={20} className="text-slate-500" />
                        <h2 className="text-lg font-bold text-slate-800">Product Database</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold">Name & Category</th>
                                    <th className="px-6 py-4 font-semibold w-1/2">Generated Description</th>
                                    <th className="px-6 py-4 font-semibold text-right">Processing Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                            <div className="text-xs font-semibold text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                                {p.category || 'Pending...'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 align-top">
                                            <p className="line-clamp-2 leading-relaxed">
                                                {p.description || (
                                                    <span className="text-slate-400 italic flex items-center gap-2">
                                                        <Cpu size={14} className="animate-pulse" /> Processing data...
                                                    </span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                p.status === 'completed' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-amber-100 text-amber-700 animate-pulse'
                                            }`}>
                                                {/* THIS IS WHERE THE TEXT CHANGES TO "COMPLETED" */}
                                                {p.status === 'completed' ? 'COMPLETED' : 'PROCESSING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12">
                                            <p className="text-slate-500 text-sm">No products found in the database.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8">
                    <LiveLogs logs={logs} />
                </div>
            </main>
        </div>
    );
}