beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test random recommendations page", () => {
    it("Should redirect to the random page", () => {       
        cy.createRecommendation(5);

        cy.visit("http://localhost:3000/");

        cy.get("[data-cy='random-page']").click();

        cy.url().should("equal", "http://localhost:3000/random");
    })   
})