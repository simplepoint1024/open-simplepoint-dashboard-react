// src/components/withBoundaryAndSuspense.tsx
import React from 'react';
import {Spin, Result} from 'antd';
import {ErrorBoundary} from './ErrorBoundary';

type TranslateFn = (key: string, fallback?: string) => string;

export function withBoundaryAndSuspense(Component: React.ComponentType, t: TranslateFn, path: string, rk: number) {
    return () => (
        <React.Suspense
            fallback={
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                }}>
                    <Spin />
                </div>
            }
        >
            <ErrorBoundary
                key={`eb-${path}-${rk}`}
                fallback={<Result status="error" title={t('error.componentCrashed')} />}
            >
                <Component key={`comp-${path}-${rk}`} />
            </ErrorBoundary>
        </React.Suspense>
    );
}
