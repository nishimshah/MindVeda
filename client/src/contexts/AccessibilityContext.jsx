import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem('mindveda_a11y_mode') || 'none');

  useEffect(() => {
    document.body.classList.remove('adhd-mode', 'dyslexia-mode', 'autism-mode');
    if (mode !== 'none') {
      document.body.classList.add(`${mode}-mode`);
    }
    localStorage.setItem('mindveda_a11y_mode', mode);
  }, [mode]);

  const toggleMode = (newMode) => {
    setMode(prev => prev === newMode ? 'none' : newMode);
  };

  return (
    <AccessibilityContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
