import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CACHE_KEY, CACHE_EXPIRY, REFRESH_INTERVAL } from '../../../shared/constants.js';
import { getAnimals } from '../services/AnimalService.js';
import { getAlerts, markAlertAsRead as apiMarkAlertAsRead } from '../services/AlertService.js';
import webSocketService from '../services/WebSocketService.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [animals, setAnimals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Reactive dynamic role management
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('sih_role') || localStorage.getItem('role') || 'FARMER';
  });

  const changeRole = useCallback((role) => {
    setActiveRole(role);
    localStorage.setItem('sih_role', role);
    localStorage.setItem('role', role);
    // Dispatch custom event to let other parts of the app know
    window.dispatchEvent(new CustomEvent('sih-role-changed', { detail: role }));
  }, []);

  const [isFarmerMode, setIsFarmerMode] = useState(() => {
    const saved = localStorage.getItem('farmer_mode');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('farmer_mode', isFarmerMode);
  }, [isFarmerMode]);

  // Try to load from cache first
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }
    return null;
  }, []);

  // Save to cache
  const saveToCache = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }, []);

  // Load initial data with automatic fallback to mock data on error/403
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const cachedData = loadFromCache();
        if (cachedData) {
          setAnimals(cachedData.animals);
          setAlerts(cachedData.alerts);
        } else {
          // Fetch from live APIs
          const [fetchedAnimals, fetchedAlerts] = await Promise.all([
            getAnimals(1),
            getAlerts(1)
          ]);
          setAnimals(fetchedAnimals || []);
          setAlerts(fetchedAlerts || []);
          saveToCache({ animals: fetchedAnimals || [], alerts: fetchedAlerts || [] });
        }
        setError(null);
      } catch (err) {
        console.error('Backend API connection unavailable:', err);
        const cachedData = loadFromCache();
        if (cachedData) {
           setAnimals(cachedData.animals);
           setAlerts(cachedData.alerts);
           setError("Operating in offline mode with cached data.");
        } else {
           setAnimals([]);
           setAlerts([]);
           setError("Could not connect to backend server and no offline data available. Ensure the server is running.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadFromCache, saveToCache]);

  // Connect to live WebSocket streaming updates
  useEffect(() => {
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe((data) => {
      if (data.type === 'telemetry') {
        setAnimals(prev => prev.map(animal => 
          animal.id === data.animalId 
            ? { 
                ...animal, 
                temperature: data.temperature, 
                activity: data.activity,
                // Feed live metrics into chart timeline history
                history: [
                  ...animal.history.slice(1),
                  {
                    time: new Date().toISOString(),
                    label: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`,
                    temperature: data.temperature,
                    activity: data.activity,
                    milkYield: animal.predictedMilkYield || animal.milkYield || 15.0
                  }
                ]
              }
            : animal
        ));
      } else if (data.type === 'alert') {
        setAlerts(prev => {
          if (prev.some(a => a.id === data.id)) return prev;
          return [data, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mark alert as read
  const markAlertRead = useCallback(async (alertId) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    try {
      // Persist to backend
      await apiMarkAlertAsRead(alertId);
    } catch (err) {
      console.warn('API error marking alert read:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedAnimals, fetchedAlerts] = await Promise.all([
        getAnimals(1),
        getAlerts(1)
      ]);
      setAnimals(fetchedAnimals);
      setAlerts(fetchedAlerts);
      saveToCache({ animals: fetchedAnimals, alerts: fetchedAlerts });
      setError(null);
    } catch (err) {
      console.warn('Silent data sync skipped:', err);
      setError("Could not connect to backend server.");
    }
  }, [saveToCache]);

  // Auto-refresh data every 500ms as requested
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOffline && !isLoading) {
        refreshData();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [refreshData, isOffline, isLoading]);

  // Get stats
  const stats = {
    totalAnimals: animals.length,
    healthyCount: animals.filter(a => a.healthStatus === 'healthy').length,
    atRiskCount: animals.filter(a => a.healthStatus !== 'healthy').length,
    avgMilkYield: animals.length > 0
      ? (animals.reduce((sum, a) => sum + (a.predictedMilkYield || a.milkYield || 15.0), 0) / animals.length).toFixed(1)
      : 0,
    unreadAlerts: alerts.filter(a => !a.read).length,
  };

  return (
    <AppContext.Provider value={{
      animals,
      setAnimals,
      alerts,
      selectedAnimal,
      setSelectedAnimal,
      isLoading,
      isOffline,
      error,
      stats,
      markAlertRead,
      sidebarOpen,
      setSidebarOpen,
      isFarmerMode,
      setIsFarmerMode,
      refreshData,
      activeRole,
      changeRole
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

