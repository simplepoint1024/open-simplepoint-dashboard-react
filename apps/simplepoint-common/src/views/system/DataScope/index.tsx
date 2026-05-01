import SimpleTable from '@simplepoint/components/SimpleTable';
import api from '@/api/index';
import {useEffect} from 'react';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';

const baseConfig = api['rbac-data-scopes'];

const App = () => {
    const {ensure, locale} = useI18n();

    useEffect(() => {
        void ensure(baseConfig.i18nNamespaces);
    }, [ensure, locale]);

    return (
        <SimpleTable
            {...baseConfig}
            submitRefreshTargets={{page: true, schema: false}}
            deleteRefreshTargets={{page: true, schema: false}}
        />
    );
};

export default App;
