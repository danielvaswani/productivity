import { Todo } from "@prisma/client";
import { useState } from "react";

type TodoCardProps = {
  todo: Todo;
  handleToggle: () => void;
  handleDelete: () => void;
  handleMove: () => void;
};

const TodoCard = ({
  todo,
  handleToggle,
  handleDelete,
  handleMove,
}: TodoCardProps) => {
  const [showTodo, setShowTodo] = useState(true);

  //, handleClick
  return (
    <div className="w-full">
      <div
        className={`${
          showTodo ? "flex" : "hidden"
        } mx-5 flex-row items-center justify-between p-6 px-10 duration-500 ${
          todo.isComplete ? "bg-blue-100" : "bg-white"
        } relative rounded border-2 border-gray-500 bg-opacity-40 shadow-xl hover:border-blue-500 motion-safe:hover:scale-[1.01]`}
        onClick={() => {
          handleToggle();
          console.log(todo.pos, todo.id);
        }}
        draggable={true}
        onDragStart={() => handleMove()}
      >
        <div
          className="absolute right-0 top-0 z-0 -m-1.5 flex h-4 w-4 items-center justify-center rounded bg-red-600 text-white motion-safe:hover:scale-[2]"
          onClick={(e) => {
            setShowTodo(!showTodo);
            handleDelete();
            e.stopPropagation();
          }}
        >
          X
        </div>
        <p
          className="w-full break-words text-black"
          style={{
            fontSize:
              todo.description.length > 25 ? 35 - todo.description.length : 25,
          }}
        >
          {todo.description}
        </p>
      </div>
    </div>
  );
};

export default TodoCard;
