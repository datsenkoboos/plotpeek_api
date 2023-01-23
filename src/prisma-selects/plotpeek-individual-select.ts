import PrismaClient from '@prisma/client'

function PlotpeekIndividualSelect(): PrismaClient.Prisma.PlotpeekArgs {
  return {
    select: {
      id: true,
      name: true,
      author: true,
      description: true,
      volume: true,
      content: true,
      views: true,
      createdBy: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  }
}

export type plotpeekIndividual = PrismaClient.Prisma.PlotpeekGetPayload<ReturnType<typeof PlotpeekIndividualSelect>>
export default PlotpeekIndividualSelect()
