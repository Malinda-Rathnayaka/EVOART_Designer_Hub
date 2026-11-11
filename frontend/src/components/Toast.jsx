import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export const Toast = () => {
  const { toast, clearToast } = useAuth();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#34d399" />,
    error: <AlertCircle size={18} color="#f43f5e" />,
    warning: <AlertTriangle size={18} color="#fbbf24" />,
  };

  return (
    <div className="toast-container" id="toast-notification">
      <div className={`toast toast-${toast.type || 'success'}`}>
        {icons[toast.type] || icons.success}
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={clearToast}
          style={{ background: 'transparent', color: 'inherit', opacity: 0.7, padding: 2 }}
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
