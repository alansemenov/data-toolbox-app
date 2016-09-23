class RcdHistoryRouter {
    constructor() {
        this.routes = {};
        window.onpopstate = (event) => this.setState(event.state);
    }

    init() {
        return this;
    }

    addRoute(state, callback) {
        this.routes[state] = callback;
        return this;
    }

    setState(state) {
        history.pushState(state, null, '#' + state);
        this.routes[state]();
        return this;
    }

    getCurrentState() {
        return location.hash && location.hash.substring(1);
    }
}