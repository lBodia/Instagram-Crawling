const baseUrl = 'instagram.com';
const host = 'https://' + baseUrl + '/';

const routes = {
    home: '',
    login: 'accounts/login/ajax/',
    graphql: 'graphql/query/',
    exploreTag: 'explore/tags/',
}

module.exports = class {
    static get(route) {
        if (!route in routes) {
            throw `Route ${route} doesn't exist!`
        }
        
        return host + routes[route];
    }
}
