// client/src/components/Ledger.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const currencyFormat = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Ledger() {
  const token = localStorage.getItem('token');
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ asset: 0, liability: 0, other: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    value: '',
    type: 'asset',
    acquiredAt: '',
    description: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ledger', { headers: { 'x-auth-token': token } });
      setItems(res.data.items || []);
      setTotals(res.data.totals || { asset: 0, liability: 0, other: 0, total: 0 });
    } catch (err) {
      console.error('Ledger load failed', err);
      alert('Failed to load ledger. Check console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setForm({ title: '', value: '', type: 'asset', acquiredAt: '', description: '' });
    setEditId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.value) {
      alert('Title and Value are required.');
      return;
    }
    try {
      if (editId) {
        const res = await axios.put(`/api/ledger/${editId}`, form, { headers: { 'x-auth-token': token } });
        setItems(items.map(it => it._id === editId ? res.data : it));
      } else {
        const res = await axios.post('/api/ledger', form, { headers: { 'x-auth-token': token } });
        setItems([res.data, ...items]);
      }
      // refresh totals reliably
      await fetchItems();
      resetForm();
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed. Check console.');
    }
  };

  const onEdit = (it) => {
    setEditId(it._id);
    setForm({
      title: it.title,
      value: it.value,
      type: it.type,
      acquiredAt: it.acquiredAt ? it.acquiredAt.substring(0,10) : '',
      description: it.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete item?')) return;
    try {
      await axios.delete(`/api/ledger/${id}`, { headers: { 'x-auth-token': token } });
      setItems(items.filter(it => it._id !== id));
      fetchItems();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '20px auto', padding: '0 16px' }}>
      <div className="ledger-header-card">
        <h1 className="ledger-title">Ledger</h1>

        <div className="ledger-top-row">
          <form className="ledger-form" onSubmit={onSubmit}>
            <input
              className="input text"
              placeholder="Title (e.g., Savings, Car)"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
            />
            <input
              className="input small"
              placeholder="Value (₹)"
              value={form.value}
              onChange={(e) => onChange('value', e.target.value)}
            />
            <select
              className="input small"
              value={form.type}
              onChange={(e) => onChange('type', e.target.value)}
            >
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="other">Other</option>
            </select>
            <input
              className="input small"
              type="date"
              value={form.acquiredAt}
              onChange={(e) => onChange('acquiredAt', e.target.value)}
            />
            <button type="submit" className={`btn primary ${editId ? 'btn-update' : ''}`}>
              {editId ? 'Update' : 'Add'}
            </button>

            <button type="button" className="btn ghost" onClick={resetForm} title="Reset">
              Reset
            </button>

            <textarea
              className="input area"
              placeholder="Optional note/description"
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
          </form>

          <div className="ledger-totals">
            <div className="tot-card">
              <div className="tot-title">Assets</div>
              <div className="tot-value" style={{ color: '#2d7a2d' }}>{currencyFormat(totals.asset)}</div>
            </div>
            <div className="tot-card">
              <div className="tot-title">Liabilities</div>
              <div className="tot-value" style={{ color: '#c82333' }}>{currencyFormat(totals.liability)}</div>
            </div>
            <div className="tot-card net">
              <div className="tot-title">Net Worth</div>
              <div className="tot-value">{currencyFormat((totals.asset || 0) - (totals.liability || 0))}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ledger-table-card">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>No ledger items yet.</div>
            <div style={{ fontSize: 13 }}>Add your first asset or liability using the form above.</div>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Title</th>
                <th style={{ width: '12%' }}>Type</th>
                <th style={{ width: '18%' }}>Value</th>
                <th style={{ width: '15%' }}>Acquired</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className={item.type === 'liability' ? 'row-liability' : item.type === 'asset' ? 'row-asset' : ''}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    {item.description && <div style={{ color: '#666', fontSize: 13 }}>{item.description}</div>}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                  <td style={{ fontWeight: 700 }}>{currencyFormat(item.value)}</td>
                  <td>{item.acquiredAt ? new Date(item.acquiredAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn small" onClick={() => onEdit(item)}>Edit</button>
                    <button className="btn small danger" onClick={() => onDelete(item._id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
