import Container from 'containers/Shoot';
import * as api from '../utils/common/api';

export const getStaticProps = async () => {
  const defaultModelList = await api.getDefaultModelList();

  return {
    props: {
      defaultModelList,
    },
  };
};

export default Container;
