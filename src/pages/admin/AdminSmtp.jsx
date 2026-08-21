import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/api';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';

export default function AdminSmtp() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const res = await fetch(`${API_BASE}/adminemails`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch emails');
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin emails');
      setEmails(['dwaynejohnsonjohnson89@gmail.com']); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    
    // basic email validation
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setAdding(true);
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const res = await fetch(`${API_BASE}/adminemails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ email: newEmail.trim() })
      });
      if (!res.ok) throw new Error('Failed to add email');
      toast.success('Admin email added successfully');
      setNewEmail('');
      fetchEmails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add admin email');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEmail = async (email) => {
    if (emails.length === 1) {
      toast.error('At least one admin email must be configured to receive notifications');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const res = await fetch(`${API_BASE}/adminemails/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete email');
      toast.success('Admin email deleted');
      fetchEmails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete admin email');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-outfit">
      <div className="hidden md:block w-56 fixed inset-y-0 left-0 z-20"><AdminSidebar /></div>
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-10">
            <AdminSidebar mobile onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-56 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"><Icon name="Menu" size={20} /></button>
          <h1 className="text-lg font-bold text-gray-900">SMTP Notification Settings</h1>
        </header>

        <div className="p-4 sm:p-6 max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
              <Icon name="Mail" size={18} className="text-primary-600" /> Admin Email Configuration
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed mb-5">
              Configure the email addresses that will receive beautifully designed HTML notifications whenever a new design order is placed.
            </p>

            <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)} 
                placeholder="Enter admin email address" 
                className="input-field flex-grow"
                disabled={adding}
              />
              <button type="submit" disabled={adding || !newEmail} className="btn-primary py-2 px-6 text-sm font-bold flex items-center gap-1.5 justify-center disabled:opacity-50">
                {adding ? 'Adding...' : <><Icon name="Plus" size={16} /> Add Email</>}
              </button>
            </form>
          </div>

          {loading ? (
            <TableSkeleton rows={4} cols={2} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configured Recipients</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">{emails.length} Emails</span>
              </div>
              <div className="divide-y divide-gray-100">
                {emails.map((email) => (
                  <div key={email} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                        <Icon name="Mail" size={14} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 font-mono">{email}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteEmail(email)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Recipient"
                    >
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
