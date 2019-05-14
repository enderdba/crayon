export class Request {
    routePattern = ''
    routePath = ''
    hash = ''
    host = ''
    hostname = ''
    href = ''
    origin = ''
    pathname = ''
    port = ''
    protocol = ''
    search = ''
    params = {}
    query = {}

    constructor() {
        if (window) {
            this.hash = window.location.hash
            this.host = window.location.host
            this.hostname = window.location.hostname
            this.href = window.location.href
            this.origin = window.location.origin
            this.pathname = window.location.pathname
            this.port = window.location.port
            this.protocol = window.location.protocol
            this.search = window.location.search
        }
    }
}