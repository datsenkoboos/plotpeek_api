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
  await prisma.summary.create({
    data: {
      name: "Chaze",
      bpm: 140,
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 899,
      wave: "/wave",
      mp3: "/mp3",
      tags: {
        connectOrCreate: [
          {
            where: { name: "s1kebeats" },
            create: { name: "s1kebeats" },
          },
          {
            where: { name: "keyglock" },
            create: { name: "keyglock" },
          },
        ],
      },
    },
  });
  await prisma.summary.create({
    data: {
      name: "outtahere",
      bpm: 122,
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 1499,
      wave: "/wave",
      mp3: "/mp3",
      tags: {
        connectOrCreate: [
          {
            where: { name: "s1kebeats" },
            create: { name: "s1kebeats" },
          },
          {
            where: { name: "gunna" },
            create: { name: "gunna" },
          },
          {
            where: { name: "wheezy" },
            create: { name: "wheezy" },
          },
        ],
      },
    },
  });
  await prisma.summary.create({
    data: {
      name: "Turnt",
      bpm: 140,
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 1299,
      wave: "/wave",
      mp3: "/mp3",
      tags: {
        connectOrCreate: [
          {
            where: { name: "s1kebeats" },
            create: { name: "s1kebeats" },
          },
          {
            where: { name: "LilTjay" },
            create: { name: "LilTjay" },
          },
          {
            where: { name: "Emotional" },
            create: { name: "Emotional" },
          },
        ],
      },
    },
  });
  await prisma.summary.create({
    data: {
      name: "PSD",
      bpm: 160,
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 1099,
      wave: "/wave",
      mp3: "/mp3",
      tags: {
        connectOrCreate: [
          {
            where: { name: "s1kebeats" },
            create: { name: "s1kebeats" },
          },
          {
            where: { name: "agressive" },
            create: { name: "agressive" },
          },
          {
            where: { name: "Emotional" },
            create: { name: "Emotional" },
          },
        ],
      },
    },
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.$disconnect();
});

it("valid request without query, should return 200 and all summarys (4)", async () => {
  const res = await request(app).get("/api/summary/");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(4);
});
it("valid request with filter by tags: gunna,emotional, should return 200 and summarys with the tags (2)", async () => {
  const res = await request(app).get("/api/summary/?tags=gunna,emotional");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(3);
});
it("valid request with filter by tags: wheezy, should return 200 and summary with 'wheezy' tag (1)", async () => {
  const res = await request(app).get("/api/summary/?tags=wheezy");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(1);
  await expect(res.body.summarys[0].name).toBe("outtahere");
});
it("valid request with filter by text: s1kebeats, should return 200 and summary with name or author username containing text query (4)", async () => {
  const res = await request(app).get("/api/summary/?q=s1kebeats");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(4);
});
it("valid request with filter by text: outta, should return 200 and summary with name or author username containing text query (1)", async () => {
  const res = await request(app).get("/api/summary/?q=outta");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(1);
});
it("valid request with filter by bpm: 140, should return 200 and summary with bpm = 140 (2)", async () => {
  const res = await request(app).get("/api/summary/?bpm=140");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(2);
  await expect(res.body.summarys[0].name).toBe("Turnt");
  await expect(res.body.summarys[1].name).toBe("Chaze");
});
it("valid request with ordering by wavePriceHigher, should return 200, all summarys (4) and sort them by wavePrice higher first", async () => {
  const res = await request(app).get("/api/summary/?sort=wavePriceHigher");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(4);
  await expect(res.body.summarys[0].name).toBe("outtahere");
});
it("valid request with ordering by wavePriceLower, should return 200, all summarys (4) and sort them by wavePrice lower first", async () => {
  const res = await request(app).get("/api/summary/?sort=wavePriceLower");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(4);
  await expect(res.body.summarys[0].name).toBe("Chaze");
});
it("valid request with filter by both bpm and text, should return 200 and summary with name or author username containing 's1kebeats' and with bpm = 122", async () => {
  const res = await request(app).get("/api/summary/?q=s1kebeats&bpm=122");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.summarys.length).toBe(1);
  await expect(res.body.summarys[0].name).toBe("outtahere");
});