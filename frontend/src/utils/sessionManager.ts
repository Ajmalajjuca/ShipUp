import { store } from '../Redux/store';
import { loginSuccess, logout } from '../Redux/slices/authSlice';

export const sessionManager = {
  setSession(user: any, token: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    store.dispatch(loginSuccess({ user, token }));
  },

  getSession() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || 'null');
    return { token, user };
  },

  clearSession() {
    try {
      // Clear all auth-related storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      
      // Clear Redux state
      store.dispatch(logout());
      
      // Clear any other auth-related data
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
    } catch (error) {
      console.error('Error during session cleanup:', error);
      throw error;
    }
  },

  setTempSession(user: any, token: string) {
    sessionStorage.setItem('tempToken', token);
    sessionStorage.setItem('pendingUser', JSON.stringify(user));
  },

  getTempSession() {
    const token = sessionStorage.getItem('tempToken');
    const user = JSON.parse(sessionStorage.getItem('pendingUser') || 'null');
    return { token, user };
  },

  clearTempSession() {
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('pendingUser');
  },

  async verifyToken() {
    const { token, user } = this.getSession();
    if (!token || !user) return false;

    try {
      const response = await fetch('http://localhost:3001/auth/verify-token', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }
};

window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && !e.newValue) {
    store.dispatch(logout());
    window.location.href = '/login';
  }
}); 