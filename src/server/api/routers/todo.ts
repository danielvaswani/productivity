import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.todo.findMany({ where: { userId: ctx.session?.user?.id } });
    }),

    post: protectedProcedure
        .input(
            z.object({
                description: z.string(),
                pos: z.number()
            }),
        )
        .mutation(({ input, ctx }) => {
            return ctx.db.todo.create({
                data: {
                    description: input.description,
                    userId: ctx.session.user.id,
                    pos: input.pos
                },
            });
        }),
    toggleIsComplete: protectedProcedure
        .input(z.object({ id: z.number(), isComplete: z.boolean() }))
        .mutation(({ input, ctx }) => {
            return ctx.db.todo.update({
                where: { id: input.id, userId: ctx.session.user.id },
                data: {
                    isComplete: input.isComplete
                },
            });
        }
        ),
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ input, ctx }) => {
            return ctx.db.todo.delete({
                where: { id: input.id, userId: ctx.session.user.id },
            });
        }
        ),
    moveUp: protectedProcedure
        .input(z.object({ id: z.number().gte(0), currentPos: z.number().gt(0), newPos: z.number().gt(0) }))
        .mutation(({ input, ctx }) => {
            return ctx.db.$transaction(async (prisma) => {

                await prisma.todo.updateMany({
                    where: {
                        userId: ctx.session.user.id, pos: {
                            gte: input.newPos,
                            lt: input.currentPos
                        },
                    },
                    data: {
                        pos: {
                            increment: 1
                        }
                    },
                });

                await prisma.todo.update({
                    where: { userId: ctx.session.user.id, id: input.id },
                    data: { pos: input.newPos },
                });

                return { success: true };
            });
        }),
    moveDown: protectedProcedure
        .input(z.object({ id: z.number().gte(0), currentPos: z.number().gt(0), newPos: z.number().gt(0) }))
        .mutation(({ input, ctx }) => {
            return ctx.db.$transaction(async (prisma) => {

                await prisma.todo.updateMany({
                    where: {
                        userId: ctx.session.user.id, pos: {
                            gt: input.currentPos,
                            lte: input.newPos,
                        }
                    },
                    data: {
                        pos: {
                            decrement: 1
                        }
                    },
                });

                await prisma.todo.update({
                    where: { userId: ctx.session.user.id, id: input.id },
                    data: { pos: input.newPos },
                });

                return { success: true };
            });
        }),
});
