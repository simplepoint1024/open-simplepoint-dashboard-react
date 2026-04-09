import SimpleTable from "@simplepoint/components/SimpleTable";
import {useEffect} from "react";
import {useI18n} from "@simplepoint/shared/hooks/useI18n";
import api from "@/api";

const baseConfig = api["monitoring-login-logs"];

const App = () => {
    const {ensure, locale} = useI18n();

    useEffect(() => {
        void ensure(baseConfig.i18nNamespaces);
    }, [ensure, locale]);

    return (
        <div>
            <SimpleTable
                {...baseConfig}
            />
        </div>
    );
};

export default App;
