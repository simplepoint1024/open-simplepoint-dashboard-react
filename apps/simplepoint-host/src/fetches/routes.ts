import {MenuInfo} from '@/store/routes';
import {get} from '@simplepoint/shared/api/methods';

export type ServiceMenuResult = {
    services: ServiceEntry[];
    routes: MenuInfo[];
    entryPoint: string;
}

export type ServiceEntry = {
    name: string;
    entry: string;
}

export function fetchServiceRoutes() {
    return get<ServiceMenuResult>('/common/menus/service-routes');
}