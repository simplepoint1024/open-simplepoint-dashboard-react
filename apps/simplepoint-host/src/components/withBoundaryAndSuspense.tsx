// src/components/withBoundaryAndSuspense.tsx
import React from 'react';
import {Spin, Result} from 'antd';
import {ErrorBoundary} from './ErrorBoundary';

export function withBoundaryAndSuspense(Component: any, t: any, path: string, rk: number) {
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
