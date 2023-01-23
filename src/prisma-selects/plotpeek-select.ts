import PrismaClient from "@prisma/client";

function PlotpeekSelect(): PrismaClient.Prisma.PlotpeekArgs {
  return {
    select: {
      id: true,
      name: true,
      author: true,
      description: true,
      volume: true,
      views: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  };
}

export type plotpeek = PrismaClient.Prisma.PlotpeekGetPayload<ReturnType<typeof PlotpeekSelect>>;
export default PlotpeekSelect();
