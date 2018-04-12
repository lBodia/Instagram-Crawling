const PageCrawler = require('./PageCrawler')

class TagCraler extends PageCrawler {
    constructor(session, tag) {
        super(session);

        this.tag = tag;

        this.regEx = Object.assign(this.regEx, {
            pageContainer: /static\/bundles\/base\/TagPageContainer.js\/\s*(.*?)\s*\.js/,
            queryHash: /byTagName\.get\(t\)\.pagination},queryId:"\s*(.*?)\s*"/,
        });
    }

    getPageUrl() {
        return this.routes.get('exploreTag') + this.tag;
    }

    hasNoMedia() {
        return this.sharedData.entry_data.TagPage[0].graphql.hashtag.is_top_media_only;
    }

    getQueryVariables() {
        return {
            tag_name: this.tag,
            first: 12,
            after: this.after,
        }
    }
    
    addFirstPageMedia() {
        let tagMedia = this.sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media;
        let firstPageMedia = tagMedia.edges;

        this.media = this.media.concat(firstPageMedia);
        this.next = tagMedia.page_info.has_next_page;
    }

    getMediaData(data) {
        return data.hashtag.edge_hashtag_to_media;
    }
}

module.exports = TagCraler