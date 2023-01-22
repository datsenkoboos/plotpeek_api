import PrismaClient from '@prisma/client'

function summarySelect (): PrismaClient.Prisma.SummaryArgs {
  return {
    select: {
      id: true,
      name: true,
      author: true,
      description: true,
      volume: true,
      views: true,
      _count: {
        select: {
          likes: true
        }
      }
    }
  }
}

export type Summary = PrismaClient.Prisma.SummaryGetPayload<ReturnType<typeof summarySelect>>
export default summarySelect()
