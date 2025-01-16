import { GetServerSideProps } from "next";

export default function Index() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "todos",
      permanent: false,
    },
  };
};
