import userService from '../services/user-service'
import ApiError from '../exceptions/api-error'
import { Request, Response, NextFunction } from 'express'
import PrismaClient from '@prisma/client'
import plotpeekService from '../services/plotpeek-service'

class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload: Pick<
      PrismaClient.Prisma.UserCreateInput,
      // activationLink is generated automatically, so we don't need to pass it in the payload type
      'email' | 'username' | 'password'
      > = (({ email, username, password }: Record<string, string>) => ({
        email,
        username,
        password,
      }))(req.body)
      const userDto = await userService.register(payload)
      return res.json(userDto)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip
      const { username, password, refresh }: { username: string, password: string, refresh: boolean } = req.body
      const userData = await userService.login(username, password, ip, !!refresh)
      if (refresh) {
        // set refresh token httpOnly cookie
        res.cookie('refreshToken', userData.refreshToken, {
          // 30 days
          maxAge: 30 * 24 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        })
      }
      return res.json({ accessToken: userData.accessToken, user: userData.user })
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip
      const { refreshToken }: { refreshToken: string } = req.cookies
      if (!refreshToken) {
        next(ApiError.UnauthorizedUser())
        return
      }
      await userService.logout(refreshToken, ip)
      // remove cookie with refresh token
      res.clearCookie('resfreshToken')
      return res.json('sucess')
    } catch (error) {
      next(error)
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { activationLink } = req.params
      await userService.activate(activationLink)
      return res.json('success')
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip
      const { refreshToken }: { refreshToken: string } = req.cookies
      if (!refreshToken) {
        next(ApiError.UnauthorizedUser())
        return
      }
      const userData = await userService.refresh(refreshToken, ip)
      // update refresh token cookie
      res.cookie('refreshToken', userData.refreshToken, {
        // 30 days
        maxAge: 30 * 24 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      })
      return res.json({ accessToken: userData.accessToken, user: userData.user })
    } catch (error) {
      next(error)
    }
  }

  async getLikedPlotpeeks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const Plotpeeks = await plotpeekService.getLikedPlotpeeks(userId, req.query.viewed ? +req.query.viewed : 0)
      return res.json({
        Plotpeeks,
        viewed: req.query.viewed ? +req.query.viewed + Plotpeeks.length : Plotpeeks.length,
      });
    } catch (error) {
      next(error)
    }
  }
}

export default new UserController()
