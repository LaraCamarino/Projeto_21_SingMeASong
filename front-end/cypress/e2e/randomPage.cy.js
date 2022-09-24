beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test random recommendations page", () => {
    it("Should redirect to the random page and only show 1 recommendation", () => {
        cy.createRecommendation(5);

        cy.visit("http://localhost:3000/");


        cy.intercept("GET", "http://localhost:5000/recommendations/random").as("random");
        cy.get("[data-cy='random-page']").click();
        cy.wait("@random").then((res) => {
            const body = res.response.body;
            expect(body).to.be.a("object");
        });

        cy.url().should("equal", "http://localhost:3000/random");
    })
})