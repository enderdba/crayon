import * as observe from './observe'
import { RoutingEvent } from './events';

declare const global: Record<string, any>

export interface CrayonState {
    events: observe.Subject<RoutingEvent>
    getRoute: () => string
    setRoute: (path: string) => void
    replaceRoute: (path: string) => void
}

export const createState = (): CrayonState => {
    let currentRoute = ''
    const state = {
        events: observe.createSubject(),
    }

    const setRoute = (path: string) => {
        currentRoute = path
        if (window && window.history && window.history.pushState) {
            window.history.pushState(null, document.head.title, path)
        }
    }

    const replaceRoute = (path: string) => {
        currentRoute = path
        if (window && window.history && window.history.pushState) {
            window.history.replaceState(null, document.title, path)
        }
    }

    const getRoute = () => currentRoute

    return {
        ...state,
        setRoute,
        replaceRoute,
        getRoute
    }
}

export const state = (): CrayonState => {
    if (typeof global !== 'undefined') {
        if (!global.crayon) {
            global.crayon = createState()
        }
        return global.crayon
    }
    if (typeof window !== 'undefined') {
        if (!(window as any).crayon) {
            (window as any).crayon = createState()
        }
        return (window as any).crayon
    }
    throw new Error('Unable to initialise')
}
