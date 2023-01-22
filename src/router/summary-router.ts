import summaryController from '../controllers/summary-controller'
import authMiddleware from '../middlewares/auth-middleware'
import { body, param, query } from 'express-validator'
import { Router } from 'express'
import validationMiddleware from '../middlewares/validation-middleware'

const router = Router()

router.post(
  '/create',
  authMiddleware,
  body('name').notEmpty().bail().isLength({ max: 255 }).bail(),
  body('author').notEmpty().bail().isLength({ max: 255 }).bail(),
  body('content').notEmpty().bail(),
  body('description').if(body('description').exists()).isLength({ max: 255 }).bail(),
  body('style').if(body('style').exists()).isLength({ max: 255 }).bail(),
  body('volume').notEmpty().bail().isDecimal().bail(),
  validationMiddleware,
  summaryController.create
)

router.get(
  '/',
  query('viewed').if(query('viewed').exists()).isDecimal().bail(),
  validationMiddleware,
  summaryController.getSummaries
)

router.get('/:id', param('id').isDecimal().bail(), validationMiddleware, summaryController.getIndividualSummary)

router.put(
  '/:id/like',
  authMiddleware,
  param('id').isDecimal().bail(),
  validationMiddleware,
  summaryController.likeToggle
)

router.delete(
  '/:id/delete',
  authMiddleware,
  param('id').isDecimal().bail(),
  validationMiddleware,
  summaryController.delete
)

export default router
