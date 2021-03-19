import { FunctionComponent } from 'react';
import Close from './Close.svg';
import Search from './Search.svg';

type Icon = 'Close' | 'Search';

type Images = {
  [key in Icon]: FunctionComponent;
};

const images: Images = {
  Close,
  Search,
};

export default images;
