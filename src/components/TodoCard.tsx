import type { Todo } from "@prisma/client";
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
  const [isMoving, setIsMoving] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  //, handleClick
  return (
    <div className="relative w-full">
      <div
        draggable={isMoving}
        onDragStart={() => handleMove()}
        className={`${
          showTodo ? "flex" : "hidden"
        } mx-5 flex-row items-center justify-between p-6 px-10 duration-500 ${
          todo.isComplete
            ? "border-opacity-50 hover:border-pink-200/90"
            : "bg-white hover:border-purple-500"
        } relative rounded-lg border-2 border-gray-500 bg-opacity-10 shadow-md motion-safe:hover:scale-[1.01]`}
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
        <div
          className={`left:0 absolute -mx-10 flex cursor-move p-5 pr-3 ${todo.isComplete ? "opacity-50" : "opacity-100"}`}
          onMouseEnter={() => setIsMoving(true)}
          onDragStart={() => setIsMoving(true)}
          onDragEnd={() => setIsMoving(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="-ml-4 size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </div>
        <div className="group flex w-full items-center justify-between">
          <p
            className={`ml-10 break-words text-black dark:text-white ${todo.isComplete ? "text-opacity-50 line-through" : ""}`}
            style={{
              fontSize:
                todo.description.length > 25
                  ? 35 - todo.description.length
                  : 25,
            }}
            contentEditable
          >
            {todo.description}
          </p>
          <div className="flex cursor-pointer items-center gap-4">
            <div
              className={`${todo.isComplete ? "text-purple-500" : "text-red-500"}`}
            >
              {/* {todo.isComplete ? "Done" : "Not Done"} */}
            </div>

            <div
              className="btn-circle flex items-center justify-center border !opacity-100 shadow-md shadow-gray-700/5"
              onClick={() => handleToggle()}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {(isHovering || todo.isComplete) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
