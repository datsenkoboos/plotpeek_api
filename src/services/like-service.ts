import PrismaClient from '@prisma/client'
const prisma = new PrismaClient.PrismaClient()

class LikeService {
  async getLikeByIdentifier (plotpeekId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.findUnique({
      where: {
        likeIdentifier: { userId, plotpeekId }
      }
    })
    return like
  }

  async deleteLike (plotpeekId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.delete({
      where: {
        likeIdentifier: { userId, plotpeekId }
      }
    })
    return like
  }

  async createLike (plotpeekId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.create({
      data: {
        user: {
          connect: { id: userId }
        },
        plotpeek: {
          connect: { id: plotpeekId }
        }
      }
    })
    return like
  }
}

export default new LikeService()
