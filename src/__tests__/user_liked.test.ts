import request from 'supertest'
import prisma from '../client'
import bcrypt from 'bcrypt'
import app from './app.js'

let id: null | number = null
beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: 's1kebeats',
        password: await bcrypt.hash('Password1234', 3),
        email: 's1kebeats@gmail.com',
        isActivated: true,
        activationLink: 's1kebeats-activation-link'
      }
    ]
  })
  const summary = await prisma.summary.create({
    data: {
      name: 'The Witcher',
      author: 'Andjey S.',
      volume: 1,
      createdBy: {
        connect: {
          username: 's1kebeats'
        }
      },
      content: 'The shortest summary'
    }
  })
  id = summary.id
})

afterEach(async () => {
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

it('unauthorized request, should return 401', async () => {
  const res = await request(app).get('/api/liked')
  expect(res.statusCode).toBe(401)
})
it('valid request, should return liked list after liking a summary', async () => {
  const login = await request(app).post('/api/login').send({
    username: 's1kebeats',
    password: 'Password1234'
  })
  const accessToken = login.body.accessToken

  await request(app).put(`/api/summary/${id}/like`).set('Authorization', `Bearer ${accessToken}`)

  const res = await request(app).get('/api/liked').set('Authorization', `Bearer ${accessToken}`)
  expect(res.statusCode).toBe(200)
  expect(res.body.summaries.length).toBe(1)
  expect(res.body.summaries[0].name).toBe('The Witcher')
  expect(res.body.viewed).toBe(1)

  await request(app).put(`/api/summary/${id}/like`).set('Authorization', `Bearer ${accessToken}`)

  const removed = await request(app).get('/api/liked').set('Authorization', `Bearer ${accessToken}`)
  expect(removed.statusCode).toBe(200)
  expect(removed.body.summaries.length).toBe(0)
  expect(removed.body.viewed).toBe(0)
})
