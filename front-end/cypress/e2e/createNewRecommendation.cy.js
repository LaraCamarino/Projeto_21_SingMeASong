import { faker } from "@faker-js/faker";

beforeEach(async () => {
  await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test create a new recommendation", () => {
  it("Should create a new recommendation", () => {
    const newRecommendation = {
      name: faker.lorem.words(3),
      url: "https://www.youtube.com/watch?v=dvgZkm1xWPE"
    }
    
    cy.visit("http://localhost:3000/")

    cy.get("[data-cy='name-input']").type(newRecommendation.name);
		cy.get("[data-cy='url-input']").type(newRecommendation.url);

    cy.intercept("POST", "http://localhost:5000/recommendations").as("createNewRecommendation");
		cy.get("[data-cy='submit-button']").click();
    cy.wait("@createNewRecommendation");

    cy.contains(newRecommendation.name).should("be.visible");
  })
})