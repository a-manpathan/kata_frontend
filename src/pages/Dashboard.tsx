import { useEffect, useState } from 'react';
import { sweetService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Sweet } from '../types';
import { Trash2, Edit, Plus, ShoppingCart, RefreshCw, LogOut, Search } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', quantity: 0 });
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const data = search 
        ? await sweetService.search(`name=${search}`) 
        : await sweetService.getAll();
      setSweets(data);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, [search]);

  const handlePurchase = async (id: string) => {
    try {
      await sweetService.purchase(id);
      fetchSweets();
    } catch (err) { 
      alert('Purchase failed - item may be out of stock'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this sweet from inventory?')) return;
    await sweetService.delete(id);
    fetchSweets();
  };

  const handleRestock = async (id: string) => {
    const amount = prompt('How many items to add to stock?');
    if (amount && parseInt(amount) > 0) {
      await sweetService.restock(id, parseInt(amount));
      fetchSweets();
    }
  };

  const handleSaveSweet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (editId) {
        await sweetService.update(editId, formData);
      } else {
        await sweetService.create(formData);
      }
      setShowForm(false);
      setFormData({ name: '', category: '', price: '', quantity: 0 });
      setEditId(null);
      fetchSweets();
    } catch (err) {
      alert('Failed to save sweet');
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (sweet: Sweet) => {
    setFormData({ 
      name: sweet.name, 
      category: sweet.category, 
      price: sweet.price, 
      quantity: sweet.quantity 
    });
    setEditId(sweet.id);
    setShowForm(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusClass = (quantity: number) => {
    if (quantity === 0) return 'status-error';
    if (quantity <= 5) return 'status-warning';
    return 'status-success';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍬</span>
              <h1 className="text-xl font-heading font-semibold text-gray-800">SweetStock</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email} • {user?.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
              <button 
                onClick={logout} 
                className="btn-secondary p-2"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search sweets..."
              className="input-field pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => { 
                setShowForm(true); 
                setEditId(null); 
                setFormData({name:'', category:'', price:'', quantity:0}); 
              }}
              className="btn-success flex items-center gap-2"
            >
              <Plus size={18} /> Add Sweet
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-sweet-pink border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {sweets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍭</div>
                <h3 className="text-lg font-heading font-medium text-gray-800 mb-2">
                  {search ? 'No sweets found' : 'No sweets in inventory'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {search ? 'Try a different search term' : 'Add some delicious sweets to get started'}
                </p>
                {!search && user?.role === 'admin' && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                  >
                    Add Your First Sweet
                  </button>
                )}
              </div>
            ) : (
              /* Grid Display */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sweets.map(sweet => (
                  <div key={sweet.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-gray-800 text-lg mb-1">{sweet.name}</h3>
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {sweet.category}
                        </span>
                      </div>
                      <span className="text-xl font-heading font-semibold text-sweet-cocoa">${sweet.price}</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Stock Level</span>
                        <span className={`${getStockStatusClass(sweet.quantity)} text-xs`}>
                          {getStockStatus(sweet.quantity)}
                        </span>
                      </div>
                      <div className="text-lg font-medium text-gray-800">{sweet.quantity} items</div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => handlePurchase(sweet.id)}
                        disabled={sweet.quantity <= 0}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                          sweet.quantity > 0 
                            ? 'btn-primary' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart size={18} /> 
                        {sweet.quantity > 0 ? 'Purchase' : 'Out of Stock'}
                      </button>

                      {/* Admin Actions */}
                      {user?.role === 'admin' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRestock(sweet.id)} 
                            className="flex-1 btn-secondary flex items-center justify-center gap-1 text-sm"
                            title="Add stock"
                          >
                            <RefreshCw size={16} /> Restock
                          </button>
                          <button 
                            onClick={() => openEdit(sweet)} 
                            className="btn-secondary p-2"
                            title="Edit sweet"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sweet.id)} 
                            className="btn-danger p-2"
                            title="Delete sweet"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal Form for Admin */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-md">
              <h2 className="text-xl font-heading font-semibold mb-6">
                {editId ? 'Edit Sweet' : 'Add New Sweet'}
              </h2>
              
              <form onSubmit={handleSaveSweet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sweet Name</label>
                  <input 
                    placeholder="e.g., Chocolate Truffle" 
                    className="input-field" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input 
                    placeholder="e.g., Chocolate, Candy, Gummy" 
                    className="input-field" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="input-field" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="input-field" 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
                    required 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="btn-success flex-1 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      editId ? 'Update Sweet' : 'Add Sweet'
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="btn-secondary flex-1"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}