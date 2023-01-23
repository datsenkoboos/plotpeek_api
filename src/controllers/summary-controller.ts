import ApiError from '../exceptions/api-error'
import summaryService from '../services/summary-service'
import { Request, Response, NextFunction } from 'express'
import PrismaClient from '@prisma/client'
import likeService from '../services/like-service'
import { Summary } from 'prisma-selects/summary-select'
import { SummaryIndividual } from 'prisma-selects/summary-individual-select'

class summaryController {
  async getSummaries (req: Request, res: Response, next: NextFunction) {
    try {
      let summaries: Summary[]
      if (Object.keys(req.query).length > 0) {
        const query: { name?: string, author?: string, volume?: number, orderBy?: string } = (({
          name,
          author,
          volume,
          orderBy
        }) => ({
          name,
          author,
          volume: volume ? +volume : undefined,
          orderBy
        }))(req.query as Record<string, string>)
        summaries = await summaryService.findSummaries(query, req.query.viewed ? +req.query.viewed : 0)
      } else {
        // get all summaries
        summaries = await summaryService.getSummaries(req.query.viewed ? +req.query.viewed : 0)
      }
      return res.json({
        summaries,
        viewed: req.query.viewed ? +req.query.viewed + summaries.length : summaries.length
      })
    } catch (error) {
      next(error)
    }
  }

  async getIndividualSummary (req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id
      const summary: SummaryIndividual = await summaryService.getIndividualSummary(id)
      return res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  async createSummary (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const payload: PrismaClient.Prisma.SummaryCreateInput = (({
        name,
        author,
        description,
        volume,
        style,
        content
      }: Record<string, string>) => ({
        name,
        author,
        description,
        volume: +volume,
        style,
        content,
        createdBy: {
          connect: { id: userId }
        }
      }))(req.body)
      const summary = await summaryService.createSummary(payload)
      return res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  async generateSummaryContent (req: Request, res: Response, next: NextFunction) {
    try {
      const payload: {
        name: string
        author: string
        volume: number
      } = (({ name, author, volume }: Record<string, string>) => ({
        name,
        author,
        volume: +volume
      }))(req.body)
      const summary = await summaryService.generateSummaryContent(payload)
      return res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  async toggleSummaryLike (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const id = +req.params.id
      // Has built in 404 Throw
      const summary = await summaryService.getSummaryById(id)
      let like: PrismaClient.Like | null
      like = await likeService.getLikeByIdentifier(summary.id, userId)
      if (like != null) {
        // delete the like from db
        like = await likeService.deleteLike(summary.id, userId)
      } else {
        // create like
        like = await likeService.createLike(summary.id, userId)
      }
      return res.json(like)
    } catch (error) {
      next(error)
    }
  }
}

export default new summaryController()
