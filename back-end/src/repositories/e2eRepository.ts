import { prisma } from "../database.js";

export async function reserRecommendations() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}