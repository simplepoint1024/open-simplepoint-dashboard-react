// src/hooks/useRegisterRemotes.ts
import {useEffect, useRef} from 'react';
import {registerRemotesIfAny} from '@/utils/MfRoutes';

export function useRegisterRemotes(res: any, isLoading: boolean) {
    const initedRef = useRef(false);

    useEffect(() => {
        if (!initedRef.current && res && !isLoading) {
            registerRemotesIfAny(res.services ?? [], res.entryPoint);
            initedRef.current = true;
        }
    }, [res, isLoading]);
}
