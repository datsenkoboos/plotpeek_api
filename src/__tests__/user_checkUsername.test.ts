import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "s1kebeats",
        password: await bcrypt.hash("Password1234", 3),
        email: "s1kebeats@gmail.com",
        isActivated: true,
        activationLink: "s1kebeats-activation-link",
      },
    ],
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("request to invalud username should return 400", async () => {
  const res = await request(app).get("/api/checkusername/_F");
  expect(res.statusCode).toBe(400);
});
it("request to unavailable username should return 200 and available = false", async () => {
  const res = await request(app).get("/api/checkusername/s1kebeats");
  expect(res.statusCode).toBe(200);
  expect(res.body.available).toBe(false);
});
it("request to available username should return 200 and available = true", async () => {
  const res = await request(app).get("/api/checkusername/notUsed");
  expect(res.statusCode).toBe(200);
  expect(res.body.available).toBe(true);
});
