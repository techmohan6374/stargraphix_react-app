import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sg_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (googleUser) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        })
      });

      if (!res.ok) {
        throw new Error('Backend authentication failed.');
      }

      const data = await res.json();
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photo: data.user.picture,
        role: data.user.role,
        provider: data.user.provider,
        token: data.jwtToken,
        joinedAt: new Date().toISOString()
      };

      localStorage.setItem('sg_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        return { success: false, error: 'Invalid credentials' };
      }

      const data = await res.json();
      const adminData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photo: data.user.picture,
        role: data.user.role,
        provider: data.user.provider,
        token: data.jwtToken,
        joinedAt: new Date().toISOString()
      };

      localStorage.setItem('sg_user', JSON.stringify(adminData));
      setUser(adminData);
      return { success: true, user: adminData };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('sg_user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    // Sync with backend /api/users/me
    try {
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }

      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        const updated = { 
          ...user, 
          name: data.name,
          photo: data.picture
        };
        localStorage.setItem('sg_user', JSON.stringify(updated));
        setUser(updated);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      // Fallback local update
      const updated = { ...user, ...updates };
      localStorage.setItem('sg_user', JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAdmin, logout, updateProfile, isAdmin: user?.role === 'admin', isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
