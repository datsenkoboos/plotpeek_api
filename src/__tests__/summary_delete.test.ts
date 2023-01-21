import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

let id: null | number = null;
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
      {
        username: "datsenkoboos",
        password: await bcrypt.hash("Password1234", 3),
        email: "datsenkoboos@gmail.com",
        activationLink: "datsenkoboos-activation-link",
        isActivated: true,
      },
    ],
  });
  const summary = await prisma.summary.create({
    data: {
      name: "The Witcher",
      author: "Andjey S.",
      volume: 1,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest summary",
    },
  });
  id = summary.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get(`/api/summary/${id}/delete`);
  await expect(res.statusCode).toBe(404);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).delete(`/api/summary/${id}/delete`);
  await expect(res.statusCode).toBe(401);
});
it("request to delete a summary that doesn't exist, should return 404", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).delete("/api/summary/-1/delete").set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(404);
});
it("request to delete summary that belongs to other user, should return 401", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).delete(`/api/summary/${id}/delete`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(401);
});
it("valid request, should return 200, delete the summary and it's media", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).delete(`/api/summary/${id}/delete`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(200);

  // check that summary was deleted
  const deleted = await request(app).get(`/api/summary/${id}`);
  await expect(deleted.statusCode).toBe(404);
}, 25000);
