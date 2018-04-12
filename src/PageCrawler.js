const axios = require('axios')
const async = require('async')
const fs = require('fs')
module.exports = class {
    constructor(session) {
        this.session = session;
        this.routes = require('./ApiRoutes');

        this.query_hash = '';
        this.after = '';
        this.next = true;

        this.media = [];

        this.regEx = {
            sharedData: /window\._sharedData = \s*(.*?)\s*;<\/script>/,
            after: /{"has_next_page":true,"end_cursor":"\s*(.*?)\s*\"}/,
        }
    }

    getMedia(pages) {
        return new Promise((resolve, reject) => {
            let url = this.getPageUrl();

            this.getPageContent(url)
                .then(pageContent => {
                    this.pageContent = pageContent;
                    this.parseSharedData();

                    if (this.hasNoMedia()) {
                        throw "No Recent Media";
                        return;
                    }

                    this.addFirstPageMedia();

                    return this.getQueryHash();
                }, error => console.log(error))
                
                .then(queryHash => {
                    this.query_hash = queryHash;
                    this.parseAfterValue();
                    let pageCount = 1;

                    async.whilst(
                        () => pageCount <= pages && this.next === true,
                        callback => {
                            pageCount++;

                            this.fetchMedia().then(data => {
                                let mediaData = this.getMediaData(data);

                                let pageInfo = mediaData.page_info;

                                this.media = this.media.concat(mediaData.edges);
                                this.after = pageInfo.end_cursor;
                                this.next = pageInfo.has_next_page;
                                
                                callback(null);
                            }, error => callback(error));
                        },
                        error => {
                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve(this.media);
                        }
                    );
                }, error => reject(error));
        });
    }

    getPageContent(url) {
        return new Promise((resolve, reject) => {
            axios.get(url).then(response => resolve(response.data)).catch(error => reject(error));
        });
    }

    parseSharedData() {
        this.sharedData = JSON.parse(this.regEx.sharedData.exec(this.pageContent)[1]);
    }

    parseAfterValue() {
        this.after = this.regEx.after.exec(this.pageContent)[1];
    }

    parsePageContainerFilePath() {
        return this.routes.get('home') + this.regEx.pageContainer.exec(this.pageContent)[0];
    }

    parseQueryHash(fileContent) {
        return this.regEx.queryHash.exec(fileContent)[1];
    }

    getQueryHash() {
        let filePath = this.parsePageContainerFilePath();

        return new Promise((resolve, reject) => {
            axios.get(filePath).then(
                response => {
                    let queryHash = this.parseQueryHash(response.data);

                    resolve(queryHash);
                },
                error => reject(error)
            );
        });
    }

    fetchMedia()  {
        let request = {
            params: {
                query_hash: this.query_hash,
                variables: JSON.stringify(this.getQueryVariables())
            },
            headers: {
                'cookie': `ig_pr=1; rur=FRC;sessionid=${this.session.cookies.sessionid};csrftoken=${this.session.cookies.csrftoken}`,
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36',
            }
        }

        return new Promise((resolve, reject) => {
            axios.get(this.routes.get('graphql'), request).then(
                response => resolve(response.data.data),
                error => reject(error)
            );
        });
    }
}
