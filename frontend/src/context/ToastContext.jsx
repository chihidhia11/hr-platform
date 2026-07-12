import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toastConfig = {
    success: {
      background: 'linear-gradient(135deg, #059669, #10B981)',
      icon: '✅',
      shadow: '0 8px 32px rgba(16,185,129,0.35)'
    },
    error: {
      background: 'linear-gradient(135deg, #DC2626, #EF4444)',
      icon: '❌',
      shadow: '0 8px 32px rgba(239,68,68,0.35)'
    },
    info: {
      background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
      icon: 'ℹ️',
      shadow: '0 8px 32px rgba(37,99,235,0.35)'
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type] || toastConfig.info;
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                background: config.background,
                color: 'white',
                padding: '14px 20px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: config.shadow,
                cursor: 'pointer',
                maxWidth: '360px',
                minWidth: '260px',
                animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.01em',
                lineHeight: 1.4,
                pointerEvents: 'all',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{config.icon}</span>
              <span>{toast.message}</span>
              <span style={{
                marginLeft: 'auto', opacity: 0.7,
                fontSize: '16px', flexShrink: 0
              }}>×</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}