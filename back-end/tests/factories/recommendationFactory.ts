import { faker } from "@faker-js/faker";

export function createNewRecommendation() {
    return {
        name: faker.lorem.words(3),
        youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE"
    };
};