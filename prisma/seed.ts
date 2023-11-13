import { prisma } from "~/utils/db.server";

async function seed() {
  console.log("🌱 Seeding...");
  console.time(`🌱 Database has been seeded`);

  const exchangeId = "clovnj486000008l87l3cc81j";
  // const aydrianUserId = "user_2Xxvy2cWrKPa6UcvsngnemhdVfI";
  await prisma.exchange.create({
    data: {
      dueDate: new Date(2023, 10, 24, 12),
      id: exchangeId,
      title: "Test Exchange",
      year: "2023"
    }
  });

  // await prisma.mailingAddress.create({
  //   data: {
  //     address1: "111 W 70th St",
  //     address2: "Apt 1F",
  //     city: "New York",
  //     phone: "317-306-1715",
  //     state: "NY",
  //     userId: aydrianUserId,
  //     zip: "10023"
  //   }
  // });

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
