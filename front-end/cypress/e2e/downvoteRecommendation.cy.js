beforeEach(async () => {
    await cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

describe("Test downvote a recommendation", () => {
    it("Should downvote a recommendation and show updated number os votes", () => {
        cy.createRecommendation(1);

        cy.visit("http://localhost:3000/");

        cy.get("[data-cy='votes-number']").invoke("text").then((initialVotes) => {

            cy.get("[data-cy='downvote']").click();

            cy.get("[data-cy='votes-number']").invoke("text").should((actualVotes) => {
                expect(actualVotes).to.eq(`${Number(initialVotes) - 1}`)
            });
        });
    })   
})

