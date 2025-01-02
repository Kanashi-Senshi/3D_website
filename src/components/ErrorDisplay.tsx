// src/components/ErrorDisplay.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '0.5rem',
      color: '#EF4444',
      gap: '1rem'
    }}>
      <AlertTriangle size={32} />
      <div style={{
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          Error Loading Data
        </h3>
        <p style={{
          color: '#9CA3AF',
          fontSize: '0.875rem'
        }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#DC2626')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#EF4444')}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
