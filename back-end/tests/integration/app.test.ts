import supertest from "supertest";
import { prisma } from "../../src/database";
import app from "../../src/app";
import * as recommendationFactory from "../factories/recommendationFactory";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations"`;
});

describe("Test POST /recommendations", () => {
    it("Should create a new recommendation and return statusCode 201", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        const result = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(result.status).toEqual(201);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: newRecommendation.name }
        });
        expect(createdRecommendation).not.toBeNull();
    });

    it("If request body is invalid, should return statusCode 422", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();
        delete newRecommendation.youtubeLink;

        const result = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(result.status).toEqual(422);
    });

    it("If new recommendation name already exists, should return statusCode 409", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        await supertest(app).post("/recommendations").send(newRecommendation);

        const result = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(result.status).toEqual(409);
    });
});

describe("Test POST /recommendations/:id/upvote", () => {
    it("Should add a vote to the recommendation score and return statusCode 200", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        const addRecommendation = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(addRecommendation.status).toEqual(201);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: newRecommendation.name }
        });
        expect(createdRecommendation).not.toBeNull();

        const result = await supertest(app).post(`/recommendations/${createdRecommendation.id}/upvote`);
        expect(result.status).toEqual(200);

        const upvotedRecommendation = await prisma.recommendation.findUnique({
            where: { id: createdRecommendation.id }
        });

        expect(upvotedRecommendation.score).toEqual(createdRecommendation.score + 1);
    });

    it("If the recommendation ID is invalid, should return statusCode 404", async () => {
        const invalidId = 0;

        const result = await supertest(app).post(`/recommendations/${invalidId}/upvote`);
        expect(result.status).toEqual(404);
    });
});

describe("Test POST /recommendations/:id/downvote", () => {
    it("Should remove a vote from the recommendation score and return statusCode 200", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        const addRecommendation = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(addRecommendation.status).toEqual(201);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: newRecommendation.name }
        });
        expect(createdRecommendation).not.toBeNull();

        const result = await supertest(app).post(`/recommendations/${createdRecommendation.id}/downvote`);
        expect(result.status).toEqual(200);

        const downvotedRecommendation = await prisma.recommendation.findUnique({
            where: { id: createdRecommendation.id }
        });

        expect(downvotedRecommendation.score).toEqual(createdRecommendation.score - 1);
    });

    it("If the recommendation ID is invalid, should return statusCode 404", async () => {
        const invalidId = 0;

        const result = await supertest(app).post(`/recommendations/${invalidId}/downvote`);
        expect(result.status).toEqual(404);
    });

    it("If the recommendation has more than 5 downvotes, should remove the recommendation from the database", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        const addRecommendation = await supertest(app).post("/recommendations").send(newRecommendation);
        expect(addRecommendation.status).toEqual(201);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: newRecommendation.name }
        });
        expect(createdRecommendation).not.toBeNull();

        //Downvote recommendation more than 5 times
        for (let i = 0; i < 6; i++) {
            await supertest(app).post(`/recommendations/${createdRecommendation.id}/downvote`);
        }

        const downvotedRecommendation = await prisma.recommendation.findUnique({
            where: { id: createdRecommendation.id }
        });
        expect(downvotedRecommendation).toBeNull();
    });
});

describe("Test GET /recommendations", () => {
    it("Should return array with the last 10 recommendations and statusCode 200", async () => {
        const number = Math.floor(Math.random() * 15);

        for (let i = 0; i < number; i++) {
            const newRecommendation = recommendationFactory.createNewRecommendation();

            await supertest(app).post("/recommendations").send(newRecommendation);
        }

        const result = await supertest(app).get("/recommendations");
        expect(result.status).toEqual(200);
        expect(result.body).toBeInstanceOf(Array);
        expect(result.body.length).toBeLessThanOrEqual(10);
    });
});

describe("Test GET /recommendations/:id", () => {
    it("Should return the recommendation which corresponds the given ID and statusCode 200", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        await supertest(app).post("/recommendations").send(newRecommendation);

        const createdRecommendation = await prisma.recommendation.findUnique({
            where: { name: newRecommendation.name }
        });

        const result = await supertest(app).get(`/recommendations/${createdRecommendation.id}`);

        expect(result.status).toEqual(200);
        expect(result.body).toBeInstanceOf(Object);
        expect(result.body).toEqual(createdRecommendation);
    });

    it("If the recommendation ID is invalid, should return statusCode 404", async () => {
        const invalidId = 0;

        const result = await supertest(app).get(`/recommendations/${invalidId}`);
        expect(result.status).toEqual(404);
    });
});

describe("Test GET /recommendations/random", () => {
    it("Should return a random recommendation and statusCode 200", async () => {
        const newRecommendation = recommendationFactory.createNewRecommendation();

        await supertest(app).post("/recommendations").send(newRecommendation);

        const result = await supertest(app).get("/recommendations/random");
        expect(result.status).toEqual(200);
        expect(result.body).toBeInstanceOf(Object);
    });

    it("If there are no recommendations, should return statusCode 404", async () => {
        const result = await supertest(app).get("/recommendations/random");
        expect(result.status).toEqual(404);
    });
});

describe("Test GET /recommendations/top/:amount", () => {
    it("Should return an array with the top X recommendations and statusCode 200, X being the amount provided by the user", async () => {
        const amount = Math.floor(Math.random()*10);

        for (let i = 0; i < 10; i++) {
            const newRecommendation = recommendationFactory.createNewRecommendation();

            await supertest(app).post("/recommendations").send(newRecommendation);
        }

        const recommendationsByScore = await prisma.recommendation.findMany({
            orderBy: { score: "desc" },
            take: amount
        });

        const result = await supertest(app).get(`/recommendations/top/${amount}`);
        expect(result.status).toEqual(200);
        expect(result.body).toBeInstanceOf(Array);
        expect(result.body.length).toEqual(amount);
        expect(result.body).toEqual(recommendationsByScore);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

