class RcdHistoryRouter {
    constructor() {
        this.routes = {};
        this.defaultRoute;
        window.onpopstate = (event) => this.setState(event.state);
    }

    init() {
        return this;
    }

    addDefaultRoute(callback) {
        this.defaultRoute = callback;
        return this;
    }

    addRoute(state, callback) {
        this.routes[state] = callback;
        return this;
    }

    setState(state) {
        if (state) {
            history.pushState(state, null, '#' + state);
            this.routes[state]();
        } else {
            this.defaultRoute();
        }

        return this;
    }

    getCurrentState() {
        return location.hash && location.hash.substring(1);
    }
}