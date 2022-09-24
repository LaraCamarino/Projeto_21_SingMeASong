beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test top recommendations page", () => {
    it("Should redirect to the top page", () => {
        cy.createRecommendation(5);

        cy.visit("http://localhost:3000/");

        cy.intercept("GET", "http://localhost:5000/recommendations/top/10").as("top");
        cy.get("[data-cy='top-page']").click();
        cy.wait("@top").then((res) => {
            const body = res.response.body;
            expect(body).to.be.a("array");
        });

        cy.url().should("equal", "http://localhost:3000/top");
    })
})