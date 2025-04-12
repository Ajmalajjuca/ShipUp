import { store } from '../Redux/store';
import { loginSuccess, logout } from '../Redux/slices/authSlice';
import { setEmailId, setDriverData, clearDriverData } from '../Redux/slices/driverSlice';
import axios from 'axios';

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
      const authResponse = await axios.get('http://localhost:3001/auth/verify-token', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!authResponse.data.valid) {
        this.clearSession();
        return false;
      }

      // Then get latest user data from user service
      const userResponse = await axios.get(`http://localhost:3002/api/users/${user.userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.data.success) {
        // Update session with latest user data
        this.setSession({ ...user, ...userResponse.data.user }, token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.clearSession();
      return false;
    }
  },

  async verifyPartnerToken() {
    const { token, driverData } = this.getDriverSession();
    
    if (!token || !driverData) return false;

    try {
      // Use the auth service's verify-partner-token endpoint
      const authResponse = await axios.post('http://localhost:3001/auth/verify-partner-token', 
        { email: driverData.email },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!authResponse.data.success) {
        this.clearDriverSession();
        return false;
      }

      // Check the partner's data in the partner service
      const partnerResponse = await axios.get(`http://localhost:3003/api/drivers/${driverData.partnerId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (partnerResponse.data.success) {
        // Update driver session with latest data
        this.setDriverSession(token, {
          ...driverData,
          ...partnerResponse.data.driver
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Partner token verification failed:', error);
      this.clearDriverSession();
      return false;
    }
  },

  logout() {
    this.clearSession();
    window.location.href = '/admin';
  },

  setDriverSession(token: string, driverData: any) {
    localStorage.setItem('driverToken', token);
    localStorage.setItem('driverData', JSON.stringify(driverData));
    // store.dispatch(setDriverData({ driverData, token }));
  },

  getDriverSession() {
    const token = localStorage.getItem('driverToken');
    const driverData = JSON.parse(localStorage.getItem('driverData') || 'null');
    return { token, driverData };
  },

  clearDriverSession() {
    try {
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverData');
      sessionStorage.clear();
      
      store.dispatch(clearDriverData());
      
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