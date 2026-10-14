import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(undefined);

export const SettingsProvider = ({ children }) => {
  // Hardcoded defaults since we have no backend
  const [settings] = useState({
    theme_name: 'RedHead FLIX',
    logo_url: null,
    enable_sidebar_ads: 0,
    sidebar_ads_code: '',
  });

  const [pages] = useState([]);
  const [isLoading] = useState(false);

  return (
    <SettingsContext.Provider value={{ settings, pages, isLoading, refreshSettings: () => {} }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
