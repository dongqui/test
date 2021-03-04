import ShootContainer from 'containers/shoot';
import { GetServerSideProps } from 'next';

interface Props {}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  return {
    props: {
      name: '테스트',
    },
  };
};

export default ShootContainer;
