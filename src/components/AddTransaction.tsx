import { type Transaction } from "@prisma/client";
import React, { useState } from "react";
import { api } from "~/utils/api";

export default function AddTransaction() {
  const [isDebit, setIsDebit] = useState(false);
  const utils = api.useUtils();

  const addTransaction = api.transaction.post.useMutation({
    async onMutate(newTransaction) {
      await utils.transaction.getAll.cancel();

      const prevData = utils.transaction.getAll.getData();

      utils.transaction.getAll.setData(
        undefined,
        (old) => [...(old ?? []), newTransaction] as Transaction[],
      );

      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.transaction.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.transaction.getAll.invalidate();
    },
  });

  const toggleIsDebit = () => setIsDebit(!isDebit);

  const [selectOptions, setSelectedOptions] = useState([
    "Food and Drink",
    "Rent",
    "Transportation",
    "Entertainment",
    "Income",
    "Other",
  ]);

  const [currencyAmount, setCurrencyAmount] = useState(0);
  const [isEditingCurrencyAmount, setIsEditingCurrencyAmount] = useState(false);
  const [selectOptionsIndex, setSelectedOptionsIndex] = useState(0);
  const [transactionName, setTransactionName] = useState("");

  const changeCategory = (e: { target: HTMLSelectElement }) => {
    const selectedIndex = e.target.options.selectedIndex;
    setSelectedOptionsIndex(e.target.options.selectedIndex);
    if (selectedIndex === selectOptions.length + 1) {
      const newCategory = prompt("Enter new category");
      setSelectedOptions([...selectOptions, newCategory!]);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl bg-black/10 p-4 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex w-full flex-col items-center justify-evenly gap-1 md:flex-row lg:flex-col">
          <div className="flex flex-row items-center gap-2 self-start">
            <h3 className="text-3xl">€</h3>
            <label className="swap swap-rotate h-12 w-12 rounded border bg-black bg-opacity-30 text-white">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                checked={isDebit}
                onClick={toggleIsDebit}
              />

              {/* minus icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="swap-on h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>

              {/* plus icon */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="swap-off h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15"
                />
              </svg>
            </label>
            <input
              type="number"
              min="0.00"
              step="any"
              className="input w-36"
              onChange={(e: { target: HTMLInputElement }) =>
                setCurrencyAmount(parseFloat(e.target.value))
              }
              onFocus={() => setIsEditingCurrencyAmount(true)}
              onBlur={() => {
                setIsEditingCurrencyAmount(false);
                setCurrencyAmount(Number(Number(currencyAmount).toFixed(2)));
              }}
              value={
                !isEditingCurrencyAmount
                  ? Number(currencyAmount).toFixed(2)
                  : currencyAmount
              }
            />
          </div>
          <div className="divider divider-horizontal mx-2" />
          <input
            type="text"
            placeholder={`What did you ${isDebit ? "get" : "buy"}?`}
            className="input w-full lg:w-full"
            onChange={(e: { target: HTMLInputElement }) =>
              setTransactionName(e.target.value)
            }
          />
          {/* {selectedOptionIndex} */}
        </div>
        <select
          className="select w-full self-end sm:mx-2 sm:w-3/5 md:w-1/3 lg:w-full"
          id="select-category"
          onChange={changeCategory}
        >
          <option disabled selected>
            Category
          </option>
          {selectOptions.map((option, index) => (
            <option key={index}>{option}</option>
          ))}
          {/* Add new category option */}
          <option>+ New category</option>
        </select>
      </div>
      <button
        className="btn px-8"
        onClick={() => {
          addTransaction.mutate({
            name: transactionName,
            category: selectOptions[selectOptionsIndex - 1] ?? "Other",
            value: currencyAmount * (isDebit ? 1 : -1),
          });
        }}
      >
        Add
      </button>
    </div>
  );
}
