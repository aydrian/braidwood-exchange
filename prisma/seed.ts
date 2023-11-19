import { prisma } from "~/utils/db.server";

async function seed() {
  console.log("🌱 Seeding...");
  console.time(`🌱 Database has been seeded`);

  const exchangeId = "clovnj486000008l87l3cc81j";
  const exchangeOldId = "clovnj486000008l87l3cc";
  const exchangeNewId = "clovnj486000008l87l";
  await prisma.exchange
    .create({
      data: {
        dueDate: new Date(2023, 10, 24, 12),
        id: exchangeId,
        title: "Test Exchange",
        year: "2023"
      }
    })
    .catch((e) => console.error(e));

  await prisma.exchange
    .create({
      data: {
        dueDate: new Date(2022, 10, 25, 12),
        id: exchangeOldId,
        isOpen: false,
        title: "Braidwood Corgis",
        year: "2022"
      }
    })
    .catch((e) => console.error(e));

  await prisma.exchange
    .create({
      data: {
        dueDate: new Date(2023, 12, 1, 12),
        id: exchangeNewId,
        title: "Braidwood Corgis",
        year: "2023"
      }
    })
    .catch((e) => console.error(e));

  console.timeEnd(`🌱 Database has been seeded`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
