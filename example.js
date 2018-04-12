const InstagramCrawler = require('./src/InstagramCrawler')

let instagram = new InstagramCrawler;

instagram.auth('veryactiveuser', '2Recognizer')
    .then(() => instagram.getTagMedia('kiev', 3))
    .then(media => {
        console.log(media.length);

        // return instagram.getProfileMedia('instagram', 3)
    })
    // .then(media => {
    //     console.log(media);
    // })
    .catch(error => console.error(error));







