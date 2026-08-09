import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Static admin credentials
const ADMIN_EMAIL = 'admin@stargraphix.com';
const ADMIN_PASSWORD = 'Admin@123';

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

  const loginWithGoogle = (googleUser) => {
    const userData = {
      id: googleUser.sub || `google_${Date.now()}`,
      name: googleUser.name,
      email: googleUser.email,
      photo: googleUser.picture,
      role: 'user',
      provider: 'google',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('sg_user', JSON.stringify(userData));
    setUser(userData);

    // Track users list for admin
    const users = JSON.parse(localStorage.getItem('sg_users') || '[]');
    const exists = users.find(u => u.email === userData.email);
    if (!exists) {
      users.push(userData);
      localStorage.setItem('sg_users', JSON.stringify(users));
    }
    return userData;
  };

  const loginAdmin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = {
        id: 'admin_001',
        name: 'Admin',
        email: ADMIN_EMAIL,
        photo: null,
        role: 'admin',
        provider: 'static',
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem('sg_user', JSON.stringify(adminData));
      setUser(adminData);
      return { success: true, user: adminData };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginTestUser = () => {
    const testUser = {
      id: 'test_user_001',
      name: 'Test User',
      email: 'testuser@stargraphix.demo',
      photo: null,
      role: 'user',
      provider: 'test',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('sg_user', JSON.stringify(testUser));
    setUser(testUser);
    return testUser;
  };

  const logout = () => {
    localStorage.removeItem('sg_user');
    setUser(null);
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('sg_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAdmin, loginTestUser, logout, updateProfile, isAdmin: user?.role === 'admin', isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
