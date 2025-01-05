import { Todo } from "@prisma/client";
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
      className="flex flex-row items-center gap-2"
      onSubmit={(event) => handleSubmit(event)}
    >
      <label htmlFor="description">Add Todo</label>
      <input
        type="text"
        name="description"
        id="inputText"
        className="rounded border-2 border-gray-500 px-1"
      />
      <button type="submit" className="rounded border-2 border-gray-500 px-1">
        Submit
      </button>
    </form>
  );
};

export default AddTodoForm;
