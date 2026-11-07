import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { getCategories, getMenuItems, saveMenuItem, toggleItemAvailability, deleteMenuItem, uploadItemPhoto } from '../../services/api';

export const MenuEditor: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('All');
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    tag: 'Fresh',
    imageEmoji: '☕',
    imageUrl: '',
    description: '',
    isAvailable: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, menuItems] = await Promise.all([
        getCategories(),
        getMenuItems()
      ]);
      setCategories(cats);
      setItems(menuItems);
      if (cats.length && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'cat-chai',
      price: '',
      tag: 'Fresh',
      imageEmoji: '☕',
      imageUrl: '',
      description: '',
      isAvailable: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (it: any) => {
    setEditingId(it.id);
    setFormData({
      name: it.name,
      categoryId: it.category_id,
      price: it.price.toString(),
      tag: it.tag || 'Fresh',
      imageEmoji: it.image_emoji || '☕',
      imageUrl: it.image_url || '',
      description: it.description || '',
      isAvailable: it.is_available
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadItemPhoto(file);
      if (res.success) {
        setFormData((prev) => ({ ...prev, imageUrl: res.photoUrl }));
      } else {
        alert(res.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) return;

    try {
      const payload = {
        id: editingId,
        categoryId: formData.categoryId,
        name: formData.name,
        price: parseFloat(formData.price),
        tag: formData.tag,
        imageEmoji: formData.imageEmoji,
        imageUrl: formData.imageUrl || null,
        description: formData.description,
        isAvailable: formData.isAvailable
      };

      const res = await saveMenuItem(payload);
      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        alert(res.error || 'Failed to save item');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleItemAvailability(id, !currentStatus);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_available: currentStatus ? 0 : 1 } : it))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this menu item from live database?')) {
      await deleteMenuItem(id);
      await loadData();
    }
  };

  const filteredItems = items.filter((it) => {
    const matchesCat = activeCategoryId === 'All' || it.category_id === activeCategoryId;
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Live Chai &amp; Snacks Menu Editor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real SQLite Database CRUD: upload product card background photos, update prices, and toggle live availability.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Snack / Chai</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveCategoryId('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeCategoryId === 'All' ? 'bg-[#1C3F32] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeCategoryId === c.id ? 'bg-[#1C3F32] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
      </div>

      {/* Live Items Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Item / Photo</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Tag</th>
                <th className="py-2.5 px-3">Availability Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-3">
                      {it.image_url ? (
                        <img 
                          src={it.image_url} 
                          alt={it.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-xl flex items-center justify-center border border-emerald-100">
                          {it.image_emoji || '☕'}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-slate-900">{it.name}</div>
                        <span className="text-[10px] text-emerald-700 font-bold">5% GST included</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-600">
                    {categories.find(c => c.id === it.category_id)?.name || it.category_id}
                  </td>
                  <td className="py-2.5 px-3 font-black text-slate-900 text-sm">₹{it.price}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {it.tag || 'Fresh'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => handleToggle(it.id, !!it.is_available)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition-all ${
                        it.is_available
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {it.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{it.is_available ? 'Live on POS' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(it)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit Item &amp; Photo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal with Photo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Edit Menu Item & Photo' : 'Add New Snack / Chai'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {/* Product Background Photo Uploader */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Card Background Photo (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  {formData.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#2E7D32] flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#2E7D32] transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-0.5">{uploading ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-[11px] text-slate-500">
                    Upload an appetizing photo. It will display as the card background in POS.
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Masala Bun / Lemon Tea"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="25"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#2E7D32]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fallback Emoji / Icon</label>
                  <input
                    type="text"
                    placeholder="☕ or 🍞"
                    value={formData.imageEmoji}
                    onChange={(e) => setFormData({ ...formData, imageEmoji: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Fresh"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold"
                >
                  Save to Live Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
