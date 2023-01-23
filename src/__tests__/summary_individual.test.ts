import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

function checkIndividualplotpeekResponse(body: any) {
  expect(body.createdBy.username).toBe("s1kebeats");
  expect(body.name).toBe("The Witcher");
  expect(body.author).toBe("Andjey S.");
  expect(body.content).toBe("The shortest plotpeek");
  expect(body.description).toBe("Nice");
  expect(body.style).toBe("Default");
  expect(body.views).toBe(0);
  expect(body._count.likes).toBe(0);
}

let plotpeekId: number | null = null;
beforeEach(async () => {
  await prisma.user.create({
    data: {
      username: "s1kebeats",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
  const plotpeek = await prisma.plotpeek.create({
    data: {
      name: "The Witcher",
      author: "Andjey S.",
      volume: 1,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest plotpeek",
      description: "Nice",
      style: "Default",
    },
  });
  plotpeekId = plotpeek.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.plotpeek.deleteMany();
  await prisma.$disconnect();
});

it("request to not existing plotpeek, should return 404", async () => {
  const res = await request(app).get("/api/plotpeek/-1");
  expect(res.statusCode).toBe(404);
});
it("valid request, should return 200 and send individual plotpeek data", async () => {
  const res = await request(app).get(`/api/plotpeek/${plotpeekId}`);
  expect(res.statusCode).toBe(200);

  // check response body
  checkIndividualplotpeekResponse(res.body);
});
