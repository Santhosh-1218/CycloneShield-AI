import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LocationProvider } from './context/LocationContext';
import { WeatherProvider } from './context/WeatherContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <WeatherProvider>
            <AppRoutes />
          </WeatherProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
