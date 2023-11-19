// import { defineConfig } from "@julr/vite-plugin-validate-env";
// import { type TypeOf, z } from "zod";

// const schema = {
//   // Clerk configuration
//   CLERK_AFTER_SIGN_IN_URL: z.string(),
//   CLERK_AFTER_SIGN_UP_URL: z.string(),
//   CLERK_PUBLISHABLE_KEY: z.string(),
//   CLERK_SECRET_KEY: z.string(),
//   CLERK_SIGN_IN_URL: z.string(),
//   CLERK_SIGN_UP_URL: z.string(),
//   // Database configuration
//   DATABASE_PATH: z.string(),
//   DATABASE_URL: z.string()
// };

// const zodEnv = z.object(schema);

// export default defineConfig({
//   schema,
//   validator: "zod"
// });

// declare global {
//   namespace NodeJS {
//     interface ProcessEnv extends TypeOf<typeof zodEnv> {}
//   }
// }
