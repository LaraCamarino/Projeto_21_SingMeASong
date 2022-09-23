beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test top recommendations page", () => {
    it("Should redirect to the top page", () => {       
        cy.createRecommendation(5);

        cy.visit("http://localhost:3000/");

        cy.get("[data-cy='top-page']").click();

        cy.url().should("equal", "http://localhost:3000/top");
    })   
})