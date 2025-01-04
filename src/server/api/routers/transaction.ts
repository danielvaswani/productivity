import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const transactionRouter = createTRPCRouter({

    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.transaction.findMany({ where: { userId: ctx.session?.user?.id } });
    }),

    post: protectedProcedure
        .input(z.object({ value: z.number(), name: z.string(), category: z.string() }))
        .mutation(({ input, ctx }) => {
            return ctx.db.transaction.create({
                data: {
                    value: input.value,
                    name: input.name,
                    category: input.category,
                    userId: ctx.session?.user?.id,
                },
            });
        }
        ),
    update: protectedProcedure
        .input(z.object({ id: z.number(), value: z.number(), name: z.string(), category: z.string() }))
        .mutation(({ input, ctx }) => {
            return ctx.db.transaction.update({
                where: { id: input.id },
                data: {
                    value: input.value,
                    name: input.name,
                    category: input.category,
                },
            });
        }
        ),
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ input, ctx }) => {
            return ctx.db.transaction.delete({
                where: { id: input.id },
            });
        }
        ),
});
