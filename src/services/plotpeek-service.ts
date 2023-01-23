import PrismaClient from '@prisma/client'
import plotpeekIndividualSelect, { plotpeekIndividual } from '../prisma-selects/plotpeek-individual-select'
import plotpeekSelect, { plotpeek } from '../prisma-selects/plotpeek-select'
import ApiError from '../exceptions/api-error'
import aiApi from '../openai-api'
const prisma = new PrismaClient.PrismaClient()

class PlotpeekService {
  // utils
  generatePrompt(name: string, author: string, volume: number): string {
    return `Write a short plotpeek of a storyline of a book "${name}" written by ${author}. Your plotpeek should feel like a complete story and be readable in less than ${
      volume * 2.5
    } minutes. Your answer should not contain any information about the book, should include all major events from the book storyline.`
  }

  formatPlotpeekOrderBy(orderBy: string): PrismaClient.Prisma.PlotpeekAvgOrderByAggregateInput {
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

  // get all Plotpeeks
  async getPlotpeeks(viewed = 0): Promise<plotpeek[]> {
    const plotpeeks = await prisma.plotpeek.findMany({
      ...plotpeekSelect,
      skip: viewed,
      take: 10,
    });
    return plotpeeks
  }

  // find Plotpeeks with query
  async findPlotpeeks(
    { name, author, volume, orderBy }: { name?: string, author?: string, volume?: number, orderBy?: string },
    viewed = 0
  ): Promise<plotpeek[]> {
    const queryArgs: PrismaClient.Prisma.PlotpeekWhereInput = {
      name: name ?
          {
            contains: name,
            mode: 'insensitive'
        } :
        undefined,
      author: author ?
          {
            contains: author,
            mode: 'insensitive'
        } :
        undefined,
      volume,
    };
    const plotpeeks = await prisma.plotpeek.findMany({
      take: 10,
      skip: viewed,
      where: queryArgs,
      orderBy: orderBy ?
        this.formatPlotpeekOrderBy(orderBy) :
          {
            id: 'desc'
        },
      ...plotpeekSelect,
    });
    return plotpeeks
  }

  async getIndividualPlotpeek(id: number): Promise<plotpeekIndividual> {
    const plotpeekFindUniqueArgs = {
      where: {
        id,
      },
      ...plotpeekIndividualSelect,
    };
    const plotpeek = await prisma.plotpeek.findUnique(plotpeekFindUniqueArgs)
    if (plotpeek == null) {
      throw ApiError.NotFound('plotpeek was not found.')
    }
    return plotpeek
  }

  async getPlotpeekById(id: number): Promise<PrismaClient.Plotpeek> {
    const plotpeek = await prisma.plotpeek.findUnique({
      where: {
        id,
      },
    })
    if (plotpeek == null) {
      throw ApiError.NotFound('plotpeek was not found.')
    }
    return plotpeek
  }

  async createPlotpeek(data: PrismaClient.Prisma.PlotpeekCreateInput): Promise<plotpeekIndividual> {
    const plotpeek = await prisma.plotpeek.create({
      data,
      ...plotpeekIndividualSelect,
    });
    return plotpeek
  }

  async delete(id: number) {
    await prisma.plotpeek.delete({
      where: {
        id,
      },
    })
  }

  async getLikedPlotpeeks(userId: number, viewed = 0): Promise<plotpeek[]> {
    const Plotpeeks = await prisma.plotpeek.findMany({
      take: 10,
      skip: viewed,
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      ...plotpeekSelect,
    });
    return Plotpeeks
  }

  async generatePlotpeekContent({
    name,
    author,
    volume,
  }: {
    name: string
    author: string
    volume: number
  }): Promise<string | undefined> {
    const prompt = this.generatePrompt(name, author, volume)
    const { data } = await aiApi.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1024,
      temperature: 0,
    });
    const content = data.choices[0].text
    return content
  }
}

export default new PlotpeekService()
