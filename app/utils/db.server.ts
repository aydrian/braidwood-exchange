import { PrismaClient } from "@prisma/client";
import { intervalToDuration } from "date-fns";

import { singleton } from "./singleton.server";

const prisma = singleton("prisma", () =>
  new PrismaClient().$extends({
    result: {
      corgi: {
        age: {
          compute(corgi) {
            if (corgi.birthDate) {
              return intervalToDuration({
                end: new Date(),
                start: corgi.birthDate
              });
            }
            return null;
          },
          needs: { birthDate: true }
        }
      }
    }
  })
);
prisma.$connect();

export { prisma };
