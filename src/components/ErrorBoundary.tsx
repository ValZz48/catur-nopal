import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  // @ts-ignore
  props: Props;
  // @ts-ignore
  state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('mode');
    } catch (e) {}
    window.location.reload();
  };

  private handleClearData = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0A0C07',
          color: '#F3EFE1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: '#181C14',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '32px 24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#A6E065', marginBottom: '8px' }}>
              Terjadi Kesalahan Aplikasi
            </h2>
            <p style={{ fontSize: '14px', color: '#A3A3A3', marginBottom: '20px', lineHeight: '1.5' }}>
              Aplikasi mengalami kendala tak terduga saat memuat komponen. Silakan muat ulang atau reset data lokal jika masalah berlanjut.
            </p>
            {this.state.error?.message && (
              <div style={{
                background: '#0D0F0A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                color: '#EF4444',
                wordBreak: 'break-word',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <code>{this.state.error.message}</code>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#81b64c',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Muat Ulang Aplikasi
              </button>
              <button
                onClick={this.handleClearData}
                style={{
                  background: 'transparent',
                  color: '#A3A3A3',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Reset Penyimpanan & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
