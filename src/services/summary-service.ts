import PrismaClient from '@prisma/client'
import summaryIndividualSelect, { SummaryIndividual } from '../prisma-selects/summary-individual-select'
import summarySelect, { Summary } from '../prisma-selects/summary-select'
import ApiError from '../exceptions/api-error'
const prisma = new PrismaClient.PrismaClient()

class summaryService {
  // get all summaries
  async getSummaries (viewed = 0): Promise<Summary[]> {
    const summaries = await prisma.summary.findMany({
      ...summarySelect,
      skip: viewed,
      take: 10
    })
    return summaries
  }

  formatSummaryOrderBy (orderBy: string): PrismaClient.Prisma.SummaryAvgOrderByAggregateInput {
    if (orderBy.includes('Lower')) {
      return {
        [orderBy.slice(0, -5)]: 'asc'
      }
    }
    if (orderBy.includes('Higher')) {
      return {
        [orderBy.slice(0, -6)]: 'desc'
      }
    }
    return {
      id: 'desc'
    }
  }

  // find summaries with query
  async findSummaries (
    { name, author, volume, orderBy }: { name?: string, author?: string, volume?: number, orderBy?: string },
    viewed = 0
  ): Promise<Summary[]> {
    const queryArgs: PrismaClient.Prisma.SummaryWhereInput = {
      name: name
        ? {
            contains: name,
            mode: 'insensitive'
          }
        : undefined,
      author: author
        ? {
            contains: author,
            mode: 'insensitive'
          }
        : undefined,
      volume
    }
    const summaries = await prisma.summary.findMany({
      take: 10,
      skip: viewed,
      where: queryArgs,
      orderBy: orderBy
        ? this.formatSummaryOrderBy(orderBy)
        : {
            id: 'desc'
          },
      ...summarySelect
    })
    return summaries
  }

  async getIndividualSummary (id: number): Promise<SummaryIndividual> {
    const summaryFindUniqueArgs = {
      where: {
        id
      },
      ...summaryIndividualSelect
    }
    const summary = await prisma.summary.findUnique(summaryFindUniqueArgs)
    if (summary == null) {
      throw ApiError.NotFound('Summary was not found.')
    }
    return summary
  }

  async getSummaryById (id: number): Promise<PrismaClient.Summary> {
    const summary = await prisma.summary.findUnique({
      where: {
        id
      }
    })
    if (summary == null) {
      throw ApiError.NotFound('Summary was not found.')
    }
    return summary
  }

  async create (data: PrismaClient.Prisma.SummaryCreateInput): Promise<SummaryIndividual> {
    const summary = await prisma.summary.create({
      data,
      ...summaryIndividualSelect
    })
    return summary
  }

  async delete (id: number) {
    await prisma.summary.delete({
      where: {
        id
      }
    })
  }

  async getLikedSummaries (userId: number, viewed = 0): Promise<Summary[]> {
    const summaries = await prisma.summary.findMany({
      where: {
        likes: {
          some: {
            userId
          }
        }
      },
      ...summarySelect
    })
    return summaries
  }
}

export default new summaryService()
