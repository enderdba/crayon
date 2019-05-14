export enum RoutingEventType {
    RoutingInit = 'ROUTING_INIT',
    RoutingStart = 'ROUTING_START',
    RoutingEnd = 'ROUTING_END'
}

export interface RoutingEvent {
    name: RoutingEventType
    data: any
}

export const createEvent = (
    name: RoutingEventType,
    data: any
): RoutingEvent => ({
    name,
    data
})