import { faker } from "@faker-js/faker";

Cypress.Commands.add("createRecommendation", () => {
    const newRecommendation = {
        name: faker.lorem.words(3),
        youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE"
    }

    cy.request("POST", "http://localhost:5000/recommendations", newRecommendation);
});

