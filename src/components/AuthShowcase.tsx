import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthShowcase() {
    const { data: sessionData } = useSession();
  
    return (
      <div className="right-0 top-0 p-3 fixed flex items-center justify-center gap-4">
        <p className="text-center text-sm text-black">
          {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        </p>
        <button
          className="rounded-full bg-white/10 px-10 py-3 text-sm font-semibold text-black no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
    );
  }