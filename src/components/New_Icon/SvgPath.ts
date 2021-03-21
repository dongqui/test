import { FunctionComponent } from 'react';
import Close from './svg/Close.svg';
import Search from './svg/Search.svg';

type Icon = 'Close' | 'Search';

type Images = {
  [key in Icon]: FunctionComponent;
};

const images: Images = {
  Close,
  Search,
};

export default images;
