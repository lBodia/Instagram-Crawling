const setCookie = require('set-cookie-parser')
const axios = require('axios')
const querystring = require('querystring')
const routes = require('./ApiRoutes')
const fs = require('fs')

module.exports = class {
    constructor(username, password) {
        this.credentials = {
            username,
            password,
        }

        this.cookies = {};

        this.baseHeaders = {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13E238 Instagram 10.28.0 (iPhone6,1; iPhone OS 9_3_1; en_US; en; scale=2.00; gamut=normal; 640x1136)',
            'origin' : 'https://www.instagram.com',
            'referer': 'https://www.instagram.com/',
        }
    }

    login() {
        return new Promise((resolve, reject) => {
            this.getCsrfToken().then(token => {
                this.cookies.csrftoken = token;
    
                return this.getSessionId();
            }).then(sessionId => {
                this.cookies.sessionid = sessionId;
    
                return this.saveCookies();
            }).then(() => {
                resolve({
                    cookies: this.cookies
                });
            }).catch(error => reject(error));
        });
    }

    getCsrfToken() {
        return new Promise((resolve, reject) => {
            axios.get(routes.get('home'), this.config).then(response => {
                let cookies = setCookie.parse(response);
                let token = cookies.find(cookie => cookie.name === 'csrftoken').value;

                resolve(token);
            }).catch(error => reject(error));
        })
    }

    getSessionId() {
        let config = {
            headers: Object.assign({
                'cookie': 'csrftoken=' + this.cookies.csrftoken + ';ig_pr=2;rur=ATN;',
                'x-csrftoken': this.cookies.csrftoken,
                'x-instagram-ajax': '1',
                'x-requested-with': 'XMLHttpRequest',
                'content-type':'application/x-www-form-urlencoded',
            }, this.baseHeaders)
        }

        return new Promise((resolve, reject) => {
            axios.post(routes.get('login'), querystring.stringify(this.credentials), config).then(response => {
                let cookies = setCookie.parse(response);
                let sessionId = cookies.find(cookie => cookie.name === 'sessionid').value;

                resolve(sessionId);
            }).catch(error => reject(error));
        })
    }

    saveCookies() {
        let filePath = __dirname + '/../cookies.json';
        let content = JSON.stringify(this.cookies);

        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, { flag: 'w' }, error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        })
    }
}