import PrismaClient from "@prisma/client";
const prisma = new PrismaClient.PrismaClient();

class LikeService {
  async getLikeByIdentifier(summaryId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.findUnique({
      where: {
        likeIdentifier: { userId, summaryId },
      },
    });
    return like;
  }

  async deleteLike(summaryId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.delete({
      where: {
        likeIdentifier: { userId, summaryId },
      },
    });
    return like;
  }

  async createLike(summaryId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.create({
      data: {
        user: {
          connect: { id: userId },
        },
        summary: {
          connect: { id: summaryId },
        },
      },
    });
    return like;
  }
}

export default new LikeService();
