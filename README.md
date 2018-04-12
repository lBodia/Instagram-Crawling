# Instagram-Crawling
Simple Instagram Crawling without using public API

## Installation
`npm install instagram-crawling --save`

## Usage
```javascript
const InstagramCrawler = require('instagram-crawling')

let instagram = new InstagramCrawler;

// Authorize to save user session
instagram.auth('username', 'password')
    .then(() => instagram.getTagMedia('kiev', 3)) // getTagMedia(Tag Name, Total Number of pages)
    .then(media => {
        console.log(media);

        return instagram.getProfileMedia('instagram', 3) // getProfileMedia(Username, Total Number of pages)
    })
    .then(media => {
        console.log(media);
    })
    .catch(error => console.error(error));
