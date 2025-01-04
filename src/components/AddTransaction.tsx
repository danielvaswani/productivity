import { type Transaction } from "@prisma/client";
import React, { useState } from "react";
import { api } from "~/utils/api";

export default function AddTransaction() {
  const [isDebit, setIsDebit] = useState(false);
  const utils = api.useContext();

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
    <div className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
      <input
        type="text"
        placeholder={`What did you ${isDebit ? "get" : "buy"}?`}
        className="input"
        onChange={(e: { target: HTMLInputElement }) =>
          setTransactionName(e.target.value)
        }
      />
      <div className="divider divider-horizontal" />
      <select className="select" id="select-category" onChange={changeCategory}>
        <option disabled selected>
          Category
        </option>
        {selectOptions.map((option, index) => (
          <option key={index}>{option}</option>
        ))}
        {/* Add new category option */}
        <option>+ New category</option>
      </select>
      <div className="flex items-center gap-4">
        <h3 className="text-4xl">€</h3>
        <div>
          <label className="swap swap-rotate h-12 rounded border bg-black bg-opacity-30 px-[0.85rem]">
            {/* this hidden checkbox controls the state */}
            <input type="checkbox" checked={isDebit} onClick={toggleIsDebit} />

            {/* minus icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
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
              strokeWidth={1.5}
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
            className="input w-40"
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
        {/* {selectedOptionIndex} */}
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
