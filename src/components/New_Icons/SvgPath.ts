import { FunctionComponent } from 'react';
import Close from './Close.svg';

type Icon = 'Close';

type Images = {
  [key in Icon]: FunctionComponent;
};

const images: Images = {
  Close,
};

export default images;
