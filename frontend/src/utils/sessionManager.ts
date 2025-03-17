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
      // First verify with auth service
      const authResponse = await fetch('http://localhost:3001/auth/verify-token', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!authResponse.ok) {
        return false;
      }

      // Then get latest user data from user service
      const userResponse = await fetch(`http://localhost:3002/api/users/${user.userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success) {
          // Update session with latest user data
          this.setSession({ ...user, ...userData.user }, token);
        }
      }

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
<<<<<<< Updated upstream
=======
  },

  logout() {
    this.clearSession();
    window.location.href = '/admin';
  },

  setDriverSession(token: string, driverData: any) {
    localStorage.setItem('driverToken', token);
    localStorage.setItem('driverData', JSON.stringify(driverData));
    store.dispatch(setDriverData({ driverData, token }));
  },

  getDriverSession() {
    const token = localStorage.getItem('driverToken');
    const driverData = JSON.parse(localStorage.getItem('driverData') || 'null');
    return { token, driverData };
  },

  clearDriverSession() {
    try {
      // Clear all auth-related storage
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverData');
      sessionStorage.clear();
      
      // Clear Redux state
      store.dispatch(clearDriverData());
      
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

  isDriverAuthenticated() {
    const token = localStorage.getItem('driverToken');
    return !!token;
  },

  isAdminAuthenticated() {
    const { token, user } = this.getSession();
    return token && user?.role === 'admin';
>>>>>>> Stashed changes
  }
};




window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && !e.newValue) {
    store.dispatch(logout());
    window.location.href = '/login';
  }
}); 

window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && !e.newValue) {
    store.dispatch(logout());
    window.location.href = '/admin';
  }
});