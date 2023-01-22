import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './router/index'
import errorMiddleware from './middlewares/error-middleware'

dotenv.config()

const app = express()
// enable req.ip
app.set('trust proxy', true)

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
)

app.use('/api', router)

app.use(errorMiddleware)

export default app
