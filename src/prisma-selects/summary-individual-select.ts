import PrismaClient from '@prisma/client'

function summaryIndividualSelect (): PrismaClient.Prisma.SummaryArgs {
  return {
    select: {
      id: true,
      name: true,
      author: true,
      description: true,
      volume: true,
      style: true,
      content: true,
      views: true,
      createdBy: {
        select: {
          id: true,
          username: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    }
  }
}

export type SummaryIndividual = PrismaClient.Prisma.SummaryGetPayload<ReturnType<typeof summaryIndividualSelect>>
export default summaryIndividualSelect()
