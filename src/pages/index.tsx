import Head from "next/head";
import { useState } from "react";
import AddTodoForm from "~/components/AddTodoForm";
import TodoCard from "~/components/TodoCard";
import { api } from "~/utils/api";
import { Todo } from "@prisma/client";

export default function TodoList() {
  const utils = api.useUtils();
  const todos = api.todo.getAll.useQuery();
  const setIsComplete = api.todo.toggleIsComplete.useMutation({
    async onMutate(newTodo) {
      await utils.todo.getAll.cancel();
      const prevData = utils.todo.getAll.getData();

      utils.todo.getAll.setData(undefined, (_oldData) =>
        prevData?.map((t: Todo) => ({
          ...t,
          isComplete: t.id === newTodo.id ? !t.isComplete : t.isComplete,
        })),
      );
      return { prevData };
    },
    onError(_err, _newTodo, ctx) {
      utils.todo.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      await utils.todo.getAll.invalidate();
    },
  });

  const removeTodo = api.todo.delete.useMutation({
    async onMutate(newTodo) {
      await utils.todo.getAll.cancel();
      const prevData = utils.todo.getAll.getData();

      utils.todo.getAll.setData(undefined, (_oldData) =>
        prevData?.filter((t) => t.id !== newTodo.id),
      );
      return { prevData };
    },
    onError(_err, _newTodo, ctx) {
      utils.todo.getAll.setData(undefined, ctx?.prevData);
    },
    async onSettled() {
      await utils.todo.getAll.invalidate();
    },
  });

  const [currentLine, setCurrentLine] = useState(-1);
  const [movePos, setMovePos] = useState(0);
  const [currentId, setCurrentId] = useState(0);

  const toggleTodo = (id: number, newValue: boolean) => {
    setIsComplete.mutate({
      id: id,
      isComplete: newValue,
    });
    console.log("toggled todo");
  };

  const deleteTodo = (id: number, pos: number) => {
    removeTodo.mutate({ id: id });
    console.log("deleted todo");
  };

  const moveUpQuery = api.todo.moveUp.useMutation({
    async onMutate(movement) {
      await utils.todo.getAll.cancel();
      const previousTodos = utils.todo.getAll.getData();

      utils.todo.getAll.setData(undefined, (old) => {
        const newData = old!
          .map((oldItem) => {
            if (
              oldItem.pos >= movement.newPos &&
              oldItem.pos < movement.currentPos
            ) {
              oldItem.pos += 1;
            }
            return oldItem;
          })
          .map((oldItem) => {
            if (oldItem.id === movement.id) {
              oldItem.pos = movement.newPos;
            }
            return oldItem;
          });
        return newData;
      });
      return { previousTodos };
    },
    onError(_err, _newTodo, context) {
      utils.todo.getAll.setData(undefined, context!.previousTodos!);
    },
    async onSettled() {
      await utils.todo.getAll.invalidate();
    },
  });
  const moveDownQuery = api.todo.moveDown.useMutation({
    async onMutate(movement) {
      await utils.todo.getAll.cancel();
      const previousTodos = utils.todo.getAll.getData();

      utils.todo.getAll.setData(undefined, (old) => {
        const newData = old!
          .map((oldItem) => {
            if (
              oldItem.pos > movement.currentPos &&
              oldItem.pos <= movement.newPos
            ) {
              oldItem.pos -= 1;
            }
            return oldItem;
          })
          .map((oldItem) => {
            if (oldItem.id === movement.id) {
              oldItem.pos = movement.newPos;
            }
            return oldItem;
          });
        return newData;
      });
      return { previousTodos };
    },
    onError(_err, _newTodo, context) {
      utils.todo.getAll.setData(undefined, context!.previousTodos!);
    },
    async onSettled() {
      await utils.todo.getAll.invalidate();
    },
  });

  const movePosToLine = (id: number, from: number, toLine: number) => {
    if (from === toLine || from === toLine + 1) return;
    let toPos = toLine;
    if (from > toLine) {
      //moveUp toLine + 1
      toPos += 1;
      moveUpQuery.mutate({ id: id, currentPos: from, newPos: toPos });
    } else {
      //moveDown toLine
      moveDownQuery.mutate({ id: id, currentPos: from, newPos: toPos });
    }
    console.log("Moving pos " + from + " to pos " + toPos);
  };

  return (
    <section
      className="container mx-auto flex min-h-screen select-none flex-col items-center justify-center"
      onDragEnd={() => {
        movePosToLine(currentId, movePos, currentLine);
        setCurrentId(-1);
        setCurrentLine(-1);
        setMovePos(-1);
      }}
    >
      {todos.data && (
        <>
          {todos.data
            .sort((t1, t2) => t1.pos - t2.pos)
            .map((todoItem, index) => {
              return (
                <>
                  <div
                    className="flex h-6 w-full items-center justify-center hover:border-red-600 motion-safe:hover:scale-105"
                    onDragEnter={() => setCurrentLine(index)}
                    onDrop={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div
                      className={`h-px w-64 motion-safe:hover:scale-105 ${
                        currentLine === index ? "bg-red-500" : "bg-slate-300"
                      }`}
                    ></div>
                  </div>
                  <TodoCard
                    todo={todoItem}
                    key={todoItem.id}
                    handleToggle={() => {
                      toggleTodo(todoItem.id, !todoItem.isComplete);
                    }}
                    handleDelete={() => {
                      deleteTodo(todoItem.id, todoItem.pos);
                    }}
                    handleMove={() => {
                      setMovePos(todoItem.pos);
                      setCurrentId(todoItem.id);
                    }}
                  />
                </>
                // </div>
              );
            })}
        </>
      )}

      {todos.data && todos.data.length > 0 && (
        <div
          className="flex h-6 w-96 items-center justify-center hover:border-red-600 motion-safe:hover:scale-105"
          onDragEnter={() => setCurrentLine(todos.data!.length)}
          onDragOver={(e) => e.preventDefault()}
        >
          <div
            className={`h-px w-64 motion-safe:hover:scale-105 ${
              currentLine === todos.data!.length ? "bg-red-500" : "bg-slate-300"
            }`}
          ></div>
        </div>
      )}
      <AddTodoForm index={todos.data ? todos.data.length + 1 : 1} />
    </section>
  );
}
