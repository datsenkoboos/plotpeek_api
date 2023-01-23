import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "s1kebeats",
        password: await bcrypt.hash("Password1234", 3),
        email: "s1kebeats@gmail.com",
        activationLink: "s1kebeats-activation-link",
        isActivated: true,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 400, because of plotpeek individual route", async () => {
  const res = await request(app).get("/api/plotpeek/generate");
  expect(res.statusCode).toBe(400);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).post("/api/plotpeek/generate");
  expect(res.statusCode).toBe(401);
});
it("request without name provided, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/plotpeek/generate")
    .send({
      volume: 1,
      author: "Author",
    })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.statusCode).toBe(400);
});
it("request without author provided, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/plotpeek/generate")
    .send({
      volume: 1,
      name: "Name",
    })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.statusCode).toBe(400);
});
it("request without volume provided, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/plotpeek/generate")
    .send({
      name: "Name",
      author: "Author",
    })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.statusCode).toBe(400);
});
it("request with volume < 1, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/plotpeek/generate")
    .send({
      name: "Name",
      author: "Author",
      volume: 0,
    })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.statusCode).toBe(400);
});
it("request with volume > 3, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/plotpeek/generate")
    .send({
      name: "Name",
      author: "Author",
      volume: 4,
    })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.statusCode).toBe(400);
});
// it('valid request, should return 200 and generate plotpeek content', async () => {
//   const login = await request(app).post('/api/login').send({
//     username: 's1kebeats',
//     password: 'Password1234'
//   })
//   const accessToken = login.body.accessToken

//   const res = await request(app)
//     .post('/api/plotpeek/generate')
//     .send({
//       name: 'We',
//       author: 'Zamyatin',
//       volume: 1
//     })
//     .set('Authorization', `Bearer ${accessToken}`)

//   expect(res.statusCode).toBe(200)
//   expect(typeof res.body).toBe('string')
// }, 25000)
