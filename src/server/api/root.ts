import { transactionRouter } from "~/server/api/routers/transaction";
import { createTRPCRouter } from "~/server/api/trpc";
import { todoRouter } from "./routers/todo";

export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
  todo: todoRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
