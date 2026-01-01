import '@/App.css';
import '@simplepoint/components/Simplepoint.css';
import 'antd/dist/reset.css';

import React from 'react';
import {HashRouter, Routes} from 'react-router-dom';
import {App as AntApp, ConfigProvider, theme} from 'antd';

import NavigateBar from '@/layouts/navigation-bar';

import {useI18n} from '@/layouts/i18n/useI18n';
import {useData} from '@simplepoint/shared/api/methods';
import {fetchServiceRoutes, ServiceMenuResult} from '@/fetches/routes';

import {useLocaleLoader} from '@/hooks/useLocaleLoader';
import {useRegisterRemotes} from '@/hooks/useRegisterRemotes';
import {useLeafRoutes} from '@/hooks/useLeafRoutes';
import {useRefreshKeyMap} from '@/hooks/useRefreshKeyMap';
import {useGlobalLoading} from '@/hooks/useGlobalLoading';
import {useGlobalSize} from '@/hooks/useGlobalSize';
import {useThemeMode} from '@/hooks/useThemeMode';

import {GlobalLoading} from '@/components/GlobalLoading';
import {TitleSync} from '@/components/TitleSync';
import {renderRoutes} from "@/components/RouteRenderer.tsx";

const App: React.FC = () => {
    const {globalSize} = useGlobalSize();
    const {resolvedTheme} = useThemeMode();

    const {t, locale, ready: i18nReady, loading: i18nLoading} = useI18n();
    const currentLocale = useLocaleLoader(locale);

    const {data: res, isLoading} = useData<ServiceMenuResult>(
        ['fetchServiceRoutes'],
        fetchServiceRoutes
    );

    // 远程模块注册
    useRegisterRemotes(res, isLoading);

    // 展平后的叶子路由
    const leafRoutes = useLeafRoutes(res?.routes);
    // 每个 path 对应的刷新 key
    const refreshKeyMap = useRefreshKeyMap();
    // 全局 loading 状态
    const showLoading = useGlobalLoading(i18nLoading, i18nReady, isLoading);

    return (
        <div className="content" style={{position: 'relative'}}>
            <GlobalLoading visible={showLoading} text={t('loading.resources', '正在加载资源...')}/>
            <ConfigProvider
                locale={currentLocale}
                componentSize={globalSize}
                theme={{
                    algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {colorPrimary: '#1677FF'}
                }}>
                <AntApp>
                    <HashRouter>
                        <TitleSync leafRoutes={leafRoutes} t={t}/>
                        <NavigateBar data={res?.routes ?? []}>
                            <Routes>
                                {renderRoutes(leafRoutes, refreshKeyMap, t)}
                            </Routes>
                        </NavigateBar>
                    </HashRouter>
                </AntApp>
            </ConfigProvider>
        </div>
    );
};

export default App;
