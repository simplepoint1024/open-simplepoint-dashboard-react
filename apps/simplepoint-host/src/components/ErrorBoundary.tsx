import React from 'react';

export class ErrorBoundary extends React.Component<{ children?: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* 可在此上报 */ }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children as React.ReactNode;
  }
}

