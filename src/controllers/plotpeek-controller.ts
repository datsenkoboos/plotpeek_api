import plotpeekService from '../services/plotpeek-service'
import { Request, Response, NextFunction } from 'express'
import PrismaClient from '@prisma/client'
import likeService from '../services/like-service'
import { plotpeek } from '../prisma-selects/plotpeek-select'
import { plotpeekIndividual } from '../prisma-selects/plotpeek-individual-select'

class PlotpeekController {
  async getPlotpeeks (req: Request, res: Response, next: NextFunction) {
    try {
      let plotpeeks: plotpeek[]
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
        plotpeeks = await plotpeekService.findPlotpeeks(query, req.query.viewed ? +req.query.viewed : 0)
      } else {
        // get all Plotpeeks
        plotpeeks = await plotpeekService.getPlotpeeks(req.query.viewed ? +req.query.viewed : 0)
      }
      return res.json({
        plotpeeks,
        viewed: req.query.viewed ? +req.query.viewed + plotpeeks.length : plotpeeks.length
      })
    } catch (error) {
      next(error)
    }
  }

  async getIndividualPlotpeek (req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id
      const plotpeek: plotpeekIndividual = await plotpeekService.getIndividualPlotpeek(id)
      return res.json(plotpeek)
    } catch (error) {
      next(error)
    }
  }

  async createPlotpeek (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const payload: PrismaClient.Prisma.PlotpeekCreateInput = (({
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
      const plotpeek = await plotpeekService.createPlotpeek(payload)
      return res.json(plotpeek)
    } catch (error) {
      next(error)
    }
  }

  async generatePlotpeekContent (req: Request, res: Response, next: NextFunction) {
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
      const plotpeek = await plotpeekService.generatePlotpeekContent(payload)
      return res.json(plotpeek)
    } catch (error) {
      next(error)
    }
  }

  async togglePlotpeekLike (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const id = +req.params.id
      // Has built in 404 Throw
      const plotpeek = await plotpeekService.getPlotpeekById(id)
      let like: PrismaClient.Like | null
      like = await likeService.getLikeByIdentifier(plotpeek.id, userId)
      if (like != null) {
        // delete the like from db
        like = await likeService.deleteLike(plotpeek.id, userId)
      } else {
        // create like
        like = await likeService.createLike(plotpeek.id, userId)
      }
      return res.json(like)
    } catch (error) {
      next(error)
    }
  }
}

export default new PlotpeekController()
