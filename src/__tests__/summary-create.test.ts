import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

const data = {
  name: "The Witcher",
  author: "Andjey S.",
  volume: 1,
  createdBy: {
    connect: {
      username: "s1kebeats",
    },
  },
  content: "The shortest summary",
  description: "Nice",
  style: "Default",
};

beforeEach(async () => {
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

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 400", async () => {
  const res = await request(app).get("/api/summary/create");
  // 400 because of Id param validator on the individual summary path
  await expect(res.statusCode).toBe(400);
});
it("not authorized request, should return 401", async () => {
  const res = await request(app).post("/api/summary/create").send(data);
  await expect(res.statusCode).toBe(401);
});
it("request without name provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/summary/create")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ name, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without author provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/summary/create")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ author, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request volume wave provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/summary/create")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ volume, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without content provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/summary/create")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ content, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with valid data provided, should return 200 and create the summary", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).post("/api/summary/create").set("Authorization", `Bearer ${accessToken}`).send(data);
  await expect(res.statusCode).toBe(200);

  const id = res.body.id;

  const summary = await request(app).get(`/api/summary/${id}`);
  await expect(summary.statusCode).toBe(200);
}, 25000);
