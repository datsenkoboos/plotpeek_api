import userController from '../controllers/user-controller'
import { body } from 'express-validator'
import { Router } from 'express'
import authMiddleware from '../middlewares/auth-middleware'
import validationMiddleware from '../middlewares/validation-middleware'

const router = Router()

// registration
router.post(
  '/register',
  body('email').isEmail().bail(),
  body('username')
    .notEmpty()
    .bail()
    // numbers and letters only
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  body('password').isLength({ min: 8 }).bail().matches(/\d/).bail().matches(/[A-Z]/).bail(),
  validationMiddleware,
  userController.register
)

// login
router.post(
  '/login',
  body('username').notEmpty().bail(),
  body('password').notEmpty().bail(),
  validationMiddleware,
  userController.login
)

router.get('/liked', authMiddleware, userController.getLiked)

// logout
router.post('/logout', userController.logout)

// email activation
router.get('/activate/:activationLink', userController.activate)

// refresh tokens
router.post('/refresh', userController.refresh)

export default router
