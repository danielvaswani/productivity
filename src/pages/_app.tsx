import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import Navbar from "~/components/Navbar";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <AuthedComponent>
        <Component {...pageProps} />
      </AuthedComponent>
    </SessionProvider>
  );
};

const AuthedComponent = ({ children }: { children: React.ReactNode }) => {
  const sessionData = useSession();
  return (
    <>
      <Navbar />
      {sessionData.data && children}
    </>
  );
};

export default api.withTRPC(MyApp);
