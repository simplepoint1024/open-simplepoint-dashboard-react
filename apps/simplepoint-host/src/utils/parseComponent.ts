// src/utils/parseComponent.ts
export function parseComponent(component: any) {
    if (typeof component !== 'string') {
        return {type: 'remote', payload: component};
    }

    if (component.startsWith('iframe:')) {
        return {type: 'iframe', payload: component.slice('iframe:'.length)};
    }

    if (component.startsWith('external:')) {
        return {type: 'external', payload: component.slice('external:'.length)};
    }

    return {type: 'remote', payload: component};
}
