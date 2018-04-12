const TagCrawler = require('./TagCrawler');
const ProfileCrawler = require('./ProfileCrawler');
const InstagramAuth = require('./InstagramAuth');

module.exports = class {
    auth(username, password) {
        this.auth = new InstagramAuth(username, password);
        
        return this.auth.login().then(session => this.session = session);
    }

    getProfileMedia(username, pages = 5) {
        let profileCrawler = new ProfileCrawler(this.session, username);

        return profileCrawler.getMedia(pages);
    }

    getTagMedia(tag, pages = 5) {
        let tagCrawler = new TagCrawler(this.session, tag);

        return tagCrawler.getMedia(pages);
    }
}
