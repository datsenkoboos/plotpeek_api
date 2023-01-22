import PrismaClient from '@prisma/client'
import summaryIndividualSelect, { SummaryIndividual } from '../prisma-selects/summary-individual-select'
import summarySelect, { Summary } from '../prisma-selects/summary-select'
import ApiError from '../exceptions/api-error'
import aiApi from '../openai-api'
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
      take: 10,
      skip: viewed,
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

  async generate({ name, author, volume, style }: { name: string, author: string, volume: number, style: string }) {
    const prompt = `Write a short summary of a storyline of a book ${name} by ${author}. You summary should feel like a complete story and be readable in less than ${volume * 2.5} minutes. Your answer should not contain any information about the book, should include all major event from the book storyline.`
    const { data: summary } = await aiApi.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: ?,
      temperature: ?,
    })
    return summary.choices[0].text;
  }
}

export default new summaryService()
