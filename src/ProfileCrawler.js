const PageCrawler = require('./PageCrawler')

class ProfileCrawler extends PageCrawler {
    constructor(session, username) {
        super(session);
        this.username = username;

        this.regEx = Object.assign(this.regEx, {
            pageContainer: /static\/bundles\/base\/ProfilePageContainer.js\/\s*(.*?)\s*\.js/,
            queryHash: /o\.pagination\:o},queryId\:"\s*(.*?)\s*"/,
        });
    }

    getPageUrl() {
        return this.routes.get('home') + this.username;
    }

    hasNoMedia() {
        return this.sharedData.entry_data.ProfilePage[0].graphql.user.is_private;
    }

    getQueryVariables() {
        return {
            id: this.sharedData.entry_data.ProfilePage[0].graphql.user.id,
            first: 12,
            after: this.after,
        }
    }
    
    addFirstPageMedia() {
        let userMedia = this.sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media;
        let firstPageMedia = userMedia.edges;

        this.media = this.media.concat(firstPageMedia);
        this.next = userMedia.page_info.has_next_page;
    }

    getMediaData(data) {
        return data.user.edge_owner_to_timeline_media;
    }
}

module.exports = ProfileCrawler