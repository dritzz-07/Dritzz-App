import { image_search } from 'duckduckgo-images-api';
(async () => {
    try {
        const results = await image_search({ query: 'unsplash "black car wash" "foam"', moderate: true });
        console.log(results.slice(0, 10).map(r => r.image));
    } catch(e) {
        console.log(e);
    }
})();
