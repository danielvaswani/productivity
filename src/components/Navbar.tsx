import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Navbar() {
  const { data: sessionData } = useSession();

  const router = useRouter();
  const currentUrl = router.asPath;

  return (
    <div className="flex w-full justify-between">
      {sessionData ? (
        <button className="m-3 flex rounded-md bg-white/10 px-7 py-3 text-sm font-semibold text-black no-underline transition hover:bg-white/20 dark:text-white">
          {currentUrl.slice(1) === "todos" ? (
            <>
              <div>Budgeting</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="ml-2 h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5l6 6-6 6M4.5 12h15"
                />
              </svg>
            </>
          ) : (
            <>
              <div>Todo List</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="ml-2 h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5l6 6-6 6M4.5 12h15"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <></>
      )}
      <div className="flex items-center justify-center gap-4 p-3">
        <p className="text-center text-sm text-black dark:text-white">
          {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        </p>
        <button
          className="rounded-md bg-white/10 px-6 py-3 text-sm font-semibold text-black no-underline transition hover:bg-white/20 dark:text-white"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
