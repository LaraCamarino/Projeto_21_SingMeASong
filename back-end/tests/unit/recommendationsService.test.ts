import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

describe("Test insert function", () => {
    it("Should insert the new recommendation into the database", async () => {
        const newRecommendation = {
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE"
        };

        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { });
        jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { });

        await recommendationService.insert(newRecommendation);

        expect(recommendationRepository.findByName).toBeCalled();
        expect(recommendationRepository.create).toBeCalled();
    });

    it("If the name of the recommendation is already in use, should not insert the new recommendation into the database", async () => {
        const newRecommendation = {
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE"
        };

        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { return newRecommendation });

        const result = recommendationService.insert(newRecommendation);

        expect(recommendationRepository.findByName).toBeCalled();
        expect(result).rejects.toEqual({
            type: "conflict",
            message: "Recommendations names must be unique"
        });
    });
});

describe("Test upvote function", () => {
    it("Should add a vote to the recommendation score", async () => {
        const id = 1;
        const recommendation = {
            id,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 0
        };

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => { return recommendation });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => { });

        await recommendationService.upvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("If the recommendation ID is invalid, should not add a vote to the recommendation score", async () => {
        const id = 0;

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => { });

        const result = recommendationService.upvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(result).rejects.toEqual({
            type: "not_found",
            message: ""
        });
    });
});

describe("Test downvote function", () => {
    it("Should remove a vote from the recommendation score", async () => {
        const id = 1;
        const recommendation = {
            id,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 0
        };

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => { return recommendation });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => { return recommendation });

        await recommendationService.downvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("If the recommendation ID is invalid, should not remove a vote from the recommendation score", async () => {
        const id = 0;

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => { });

        const result = recommendationService.downvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(result).rejects.toEqual({
            type: "not_found",
            message: ""
        });
    });

    it("If the recommendation has more than 5 downvotes, should remove the recommendation from the database", async () => {
        const id = 1;
        const recommendation = {
            id,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: -5
        };

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => { return recommendation });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return {
                ...recommendation,
                score: -6
            }
        }
        );
        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => { });


        await recommendationService.downvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.remove).toBeCalled();
    });
});

describe("Test get function", () => {
    it("Should return the recommendations", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [] });

        await recommendationService.get();

        expect(recommendationRepository.findAll).toBeCalled();
    });
});

describe("Test getTop function", () => {
    it("Should return the top X recommendations, X being the amount provided by the user", async () => {
        const amount = 5;

        jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => { return [] });

        await recommendationService.getTop(amount);

        expect(recommendationRepository.getAmountByScore).toBeCalled();
    });
});

describe("Test getRandom function", () => {
    it("If random < 0.7 and there are recommendations with score > 10", async () => {
        const random = 0.5;
        const recommendation = {
            id: 1,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 15
        };

        jest.spyOn(Math, "random").mockImplementationOnce((): any => { return random });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [recommendation] });

        const result = await recommendationService.getRandom();

        expect(result).toEqual(recommendation);
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("If random < 0.7 and there are no recommendations with score > 10", async () => {
        const random = 0.5;
        const recommendation = {
            id: 1,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 1
        };

        jest.spyOn(Math, "random").mockImplementationOnce((): any => { return random });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [] });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [recommendation] });

        const result = await recommendationService.getRandom();

        expect(result).toEqual(recommendation);
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("If random >= 0.7 and there are recommendations with score betwenn -5 and 10", async () => {
        const random = 0.7;
        const recommendation = {
            id: 1,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 1
        };

        jest.spyOn(Math, "random").mockImplementationOnce((): any => { return random });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [recommendation] });

        const result = await recommendationService.getRandom();

        expect(result).toEqual(recommendation);
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("If random >= 0.7 and there are no recommendations with score betwenn -5 and 10", async () => {
        const random = 0.7;
        const recommendation = {
            id: 1,
            name: "name",
            youtubeLink: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
            score: 15
        };

        jest.spyOn(Math, "random").mockImplementationOnce((): any => { return random });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [] });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [recommendation] });

        const result = await recommendationService.getRandom();

        expect(result).toEqual(recommendation);
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("If there are no recommendations yet, should return not found", async () => {
        const random = 0.7;

        jest.spyOn(Math, "random").mockImplementationOnce((): any => { return random });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [] });
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => { return [] });

        const result = recommendationService.getRandom();

        expect(recommendationRepository.findAll).toBeCalled();
        expect(result).rejects.toEqual({
            type: "not_found",
            message: ""
        });
    });
});
