import { type Transaction } from "@prisma/client";
import React from "react";
import { api } from "~/utils/api";

interface TransactionUpdatePayload {
  id: number;
  name: string;
  value: number;
  category: string;
}

export default function TransactionCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  const utils = api.useContext();
  const updateTransaction = api.transaction.update.useMutation({
    async onMutate(newTransaction) {
      await utils.transaction.getAll.cancel();

      const prevData = utils.transaction.getAll.getData();

      utils.transaction.getAll.setData(
        undefined,
        (old) => [...(old ?? []), newTransaction] as Transaction[],
      );

      return { prevData };
    },
    onError(err, newTransaction, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.transaction.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.transaction.getAll.invalidate();
    },
  });

  const deleteTransaction = api.transaction.delete.useMutation({
    async onMutate(deleteThisTransaction) {
      await utils.transaction.getAll.cancel();

      const prevData = utils.transaction.getAll.getData();

      utils.transaction.getAll.setData(
        undefined,
        (old) =>
          [
            ...(old ?? []).filter((t) => t.id !== deleteThisTransaction.id),
          ] as Transaction[],
      );

      return { prevData };
    },
    onError(err, newTransaction, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.transaction.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.transaction.getAll.invalidate();
    },
  });

  const editName = () => {
    const newName = prompt("Enter new name");
    if (!newName) return;

    const payload: TransactionUpdatePayload = {
      id: transaction.id,
      name: newName,
      value: Number(transaction.value),
      category: transaction.category,
    };

    updateTransaction.mutate({
      ...payload,
      name: newName,
    });
  };

  const editValue = () => {
    const newValue = prompt("Enter new value");
    if (!newValue) return;

    const payload: TransactionUpdatePayload = {
      id: transaction.id,
      name: transaction.name,
      value: Number(newValue) * (Number(transaction.value) < 0 ? -1 : 1),
      category: transaction.category,
    };

    updateTransaction.mutate(payload);
  };

  const editCategory = () => {
    const newCategory = prompt("Enter new category");
    if (!newCategory) return;

    const payload: TransactionUpdatePayload = {
      id: transaction.id,
      name: transaction.name,
      value: Number(transaction.value),
      category: newCategory,
    };

    updateTransaction.mutate(payload);
  };

  const deleteCard = () => {
    deleteTransaction.mutate({ id: transaction.id });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-md">{transaction.name}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
            onClick={editName}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="red"
            className="h-4 w-4"
            onClick={deleteCard}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h5 className="font-bold">
              €{String(Number(transaction.value).toFixed(2))}
            </h5>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3 w-3"
              onClick={editValue}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1">
            <div className="text-sm text-purple-300">
              {transaction.category}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3 w-3"
              onClick={editCategory}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
