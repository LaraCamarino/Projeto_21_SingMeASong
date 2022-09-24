beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test homePage", () => {
    it("Should only show the 10 most recent recommendations", () => {
        cy.createRecommendation(5);

        cy.intercept("GET", "http://localhost:5000/recommendations").as("home");
        cy.visit("http://localhost:3000/");
        cy.wait("@home").then((res) => {
            const body = res.response.body;
            expect(body).to.be.a("array");
            expect(body.length).to.not.be.greaterThan(10);
        });
    })
})