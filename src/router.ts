import * as observe from './observe'
import * as url from "./url";
import { Request } from './request'
import { Response } from './response'
import { handlerFunc } from './types'
import { Group } from "./group";
import { state } from './state'
import { RoutingEventType, createEvent, RoutingEvent } from './events'

export class Router {
    middleware: handlerFunc[] = []
    routes: Record<string, handlerFunc[]> = {}
    state: Record<string, any> = {}
    history: string[] = ['']
    req: Request | undefined
    res: Response | undefined
    isLoading = true

    get events(): observe.Subject<any> {
        return state().events
    }

    onPopState = () => this.load()
    eventListener: observe.Subscriber | undefined

    constructor() {
        window.addEventListener('popstate', this.onPopState)
        this.eventListener = state().events.subscribe(e => this.onRoutingEvent(e))
    }

    destroy() {
        this.eventListener && this.eventListener.unsubscribe()
        window.removeEventListener('popstate', this.onPopState)
    }

    onRoutingEvent(event: RoutingEvent) {
        if (event.name === RoutingEventType.RoutingInit) {
            this.load()
        }
    }

    path(path: string, ...handlers: handlerFunc[]) {
        this.routes[path] = handlers
    }

    use(target: handlerFunc | Group) {
        if (target instanceof Group) {
            this.useGroup(target)
        } else {
            this.useHandler(target)
        }
    }

    useGroup(group: Group) {
        const routes: Record<string, handlerFunc[]> = {}
        for (const route in group.routes) {
            const path = group.base + route
            routes[path] = [
                ...group.middleware,
                ...group.routes[route]
            ]
        }
        this.routes = {
            ...routes,
            ...this.routes
        }
    }

    useHandler(handler: handlerFunc) {
        this.middleware.push(handler)
    }

    // TODO block navigation if already on destination
    async navigate(path: string) {
        if (this.isLoading) {
            return
        }
        path = url.normalise(path)
        if (path === '') {
            path = '/'
        }
        state().setRoute(path)
        this.emit(createEvent(RoutingEventType.RoutingInit, path))
    }

    reload() {
        if (this.req) {
            return
        }
        // return this.load()
    }

    // TODO figure out how to not kill the router
    // is back is press while inside a transition
    back() {
        if (this.isLoading) {
            return
        }
        window.history.back()
    }

    emit(value: RoutingEvent) {
        state().events.next(value)
    }

    async load() {
        this.isLoading = true
        this.req = new Request()
        this.res = new Response()
        this.req.routePath = state().getRoute()

        this.emit(createEvent(RoutingEventType.RoutingStart, { ...this.req }))

        const path = url.normalise(this.req.pathname)
        if (path !== this.req.pathname) {
            state().replaceRoute(path)
        }

        this.res.redirect = (path: string) => {
            path = url.normalise(path)
            state().setRoute(path)
            this.isLoading = false
            this.load()
        }

        // TODO match "/**" and "/something/**" routes

        // Match and populate handlers
        let handlers: handlerFunc[] = []
        for (const key in this.routes) {
            const params = url.matchPath(key, this.req.routePath)
            if (!params) {
                continue
            }
            this.history.push(key)
            handlers = this.routes[key]
            this.req.params = { ...params }
            this.req.routePattern = url.normalise(key)
            break;
        }
        // Cast query string to object
        this.req.query = { ...url.deserializeQuery(window.location.search) }

        // Run middleware
        for (const middleware of this.middleware) {
            if (this.res.hasCompleted) {
                return
            }
            await middleware(this.req, this.res, this.state, (this as any))
        }
        // Run handlers
        for (const handler of handlers) {
            if (this.res.hasCompleted) {
                return
            }
            await handler(this.req, this.res, this.state, (this as any))
        }
        this.isLoading = false
        this.emit(createEvent(RoutingEventType.RoutingEnd, { ...this.req }))
    }
}

export const create = () => {
    state()
    return new Router()
}

