import { FunctionComponent } from 'react';
import Close from './svg/Close.svg';
import Search from './svg/Search.svg';
import EyeClose from './svg/EyeClose.svg';
import EyeOpen from './svg/EyeOpen.svg';
import LockClose from './svg/LockClose.svg';
import LockOpen from './svg/LockOpen.svg';
import ListView from './svg/ListView.svg';
import IconView from './svg/IconView.svg';
import Plus from './svg/Plus.svg';
import Model from './svg/Model.svg';
import Folder from './svg/Folder.svg';
import Motion from './svg/Motion.svg';

type Icon =
  | 'Close'
  | 'Search'
  | 'EyeClose'
  | 'EyeOpen'
  | 'LockClose'
  | 'LockOpen'
  | 'ListView'
  | 'IconView'
  | 'Plus'
  | 'Model'
  | 'Folder'
  | 'Motion';

type Images = {
  [key in Icon]: FunctionComponent;
};

const images: Images = {
  Close,
  Search,
  EyeClose,
  EyeOpen,
  LockClose,
  LockOpen,
  ListView,
  IconView,
  Plus,
  Model,
  Folder,
  Motion,
};

export default images;
