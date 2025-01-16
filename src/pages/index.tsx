import { GetServerSideProps } from "next";

export default function Index() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      source: "/",
      destination: "todos",
      permanent: false,
    },
  };
};
