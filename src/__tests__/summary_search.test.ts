import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

let userId: null | number = null;
beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      username: "s1kebeats",
      password: await bcrypt.hash("Password1234", 3),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
  userId = user.id;
  await prisma.plotpeek.create({
    data: {
      name: "The Diary of a Young Girl",
      author: "Anne Frank",
      volume: 1,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest plotpeek",
    },
  });
  await prisma.plotpeek.create({
    data: {
      name: "The Witcher",
      author: "Andjey S.",
      volume: 2,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest plotpeek",
    },
  });
  await prisma.plotpeek.create({
    data: {
      name: "witcher",
      author: "Andjey S.",
      volume: 3,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest plotpeek",
    },
  });
  await prisma.plotpeek.create({
    data: {
      name: "To Kill a Mockingbird",
      author: "Harper Lee",
      volume: 3,
      createdBy: {
        connect: {
          username: "s1kebeats",
        },
      },
      content: "The shortest plotpeek",
    },
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.plotpeek.deleteMany();
  await prisma.$disconnect();
});

it("valid request without query, should return 200 and all Plotpeeks (4)", async () => {
  const res = await request(app).get("/api/plotpeek/");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(4);
});
it("valid request with filter by name: The Witcher, should return 200 and Plotpeeks with equal name (2)", async () => {
  const res = await request(app).get("/api/plotpeek/?name=witcher");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(2);
});
it("valid request with filter by volume: 3, should return 200 and Plotpeeks with given volume (2)", async () => {
  const res = await request(app).get("/api/plotpeek/?volume=3");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(2);
});
it("valid request with filter by author: Anne Frank, should return 200 and plotpeek with author containing text query (1)", async () => {
  const res = await request(app).get("/api/plotpeek/?author=anne+frank");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(1);
  expect(res.body.Plotpeeks[0].name).toBe("The Diary of a Young Girl");
});
it("valid request with ordering by volumeHigher, should return 200, all Plotpeeks (4) and sort them by volume higher first", async () => {
  const res = await request(app).get("/api/plotpeek/?sort=volumeHigher");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(4);
  expect(res.body.Plotpeeks[0].name).toBe("To Kill a Mockingbird");
});
it("valid request with ordering by volumeLower, should return 200, all Plotpeeks (4) and sort them by volume lower first", async () => {
  const res = await request(app).get("/api/plotpeek/?sort=volumeLower");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(4);
  expect(res.body.Plotpeeks[0].name).toBe("The Diary of a Young Girl");
});
it("valid request with filter by both volume and name, should return 200 and plotpeek with name containing 'witcher' and with volume = 3", async () => {
  const res = await request(app).get("/api/plotpeek/?name=witcher&volume=3");
  expect(res.statusCode).toBe(200);
  expect(res.body.Plotpeeks.length).toBe(1);
  expect(res.body.Plotpeeks[0].name).toBe("witcher");
});
