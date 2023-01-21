import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

let id: number | null = null;
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
  const summary = await prisma.summary.create({
    data: {
      name: "outtahere",
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 499,
      wave: "wave/",
      mp3: "mp3/",
      image: "image/",
    },
  });
  id = summary.id;
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.like.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get(`/api/summary/${id}/like`);
  await expect(res.statusCode).toBe(404);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).put(`/api/summary/${id}/like`);
  await expect(res.statusCode).toBe(401);
});
it("request to not existing summary should return 404", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).put("/api/-1/like").set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(404);
});
it("valid request, should return 200 and add the like", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).put(`/api/summary/${id}/like`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(200);

  const summary = await request(app).get(`/api/summary/${id}`);
  await expect(summary.body._count.likes).toBe(1);
});
it("valid request, should return 200 and remove the like", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).put(`/api/summary/${id}/like`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(200);

  const summary = await request(app).get(`/api/summary/${id}`);
  await expect(summary.body._count.likes).toBe(0);
});