import type { Todo } from "@prisma/client";
import { api } from "~/utils/api";

type AddTodoFormProps = {
  index: number;
};

const AddTodoForm = ({ index }: AddTodoFormProps) => {
  const utils = api.useUtils();

  const addTodoMutation = api.todo.post.useMutation({
    async onMutate(newTodo) {
      await utils.todo.getAll.cancel();

      const prevData = utils.todo.getAll.getData();

      utils.todo.getAll.setData(
        undefined,
        (old) => [...(old ?? []), newTodo] as Todo[],
      );

      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.todo.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.todo.getAll.invalidate();
    },
  });

  const handleSubmit = (event: React.SyntheticEvent) => {
    // 👇️ prevent page refresh
    event.preventDefault();
    const inputTextElement: HTMLInputElement =
      document.querySelector("#inputText")!;
    addTodo(inputTextElement.value);
    inputTextElement.value = "";
  };

  const addTodo = (description: string) => {
    addTodoMutation.mutate({ description: description, pos: index });
    console.log("todo " + description + " added");
  };

  //, handleClick
  return (
    <form
      className="flex w-full flex-row items-center gap-2 p-5"
      onSubmit={(event) => handleSubmit(event)}
    >
      <input
        type="text"
        name="description"
        id="inputText"
        className="w-full rounded border-2 border-gray-200 p-3"
        placeholder="Add a Todo List item here..."
      />
      <button
        type="submit"
        className="w-36 rounded bg-purple-700 p-3 font-semibold text-white shadow-lg shadow-purple-700/40"
      >
        Add Todo
      </button>
    </form>
  );
};

export default AddTodoForm;
