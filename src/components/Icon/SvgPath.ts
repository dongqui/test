import { FunctionComponent } from 'react';
import Close from './svg/Close.svg';
import EyeClose from './svg/EyeClose.svg';
import EyeOpen from './svg/EyeOpen.svg';
import EyeOpenWhite from './svg/EyeOpenWhite.svg';
import LockClose from './svg/LockClose.svg';
import LockOpen from './svg/LockOpen.svg';
import Plus from './svg/Plus.svg';
import CameraReset from './svg/CameraReset.svg';
// import Model from './svg/Model.svg';
// import Directory from './svg/Directory.svg';
// import Motion from './svg/Motion.svg';
import FilledArrow from './svg/FilledArrow.svg';
import More from './svg/More.svg';
import ChevronLeft from './svg/ChevronLeft.svg';
import ChevronRight from './svg/ChevronRight.svg';
import ChevronUp from './svg/ChevronUp.svg';
import ChevronDown from './svg/ChevronDown.svg';
import BreadcrumbMore from './svg/BreadcrumbMore.svg';
import Layer from './svg/Layer.svg';
import Camera from './svg/Camera.svg';
import Dopesheet from './svg/Dopesheet.svg';
import PlayArrow from './svg/PlayArrow.svg';
import RewindArrow from './svg/RewindArrow.svg';
import Pause from './svg/Pause.svg';
import Export from './svg/Export.svg';
import PlayBar from './svg/PlayBar.svg';
import CaretRight from './svg/CaretRight.svg';
import CaretDown from './svg/CaretDown.svg';
import LineLeftTriangle from './svg/LineLeftTriangle.svg';
import Check from './svg/Check.svg';
import Error from './svg/Error.svg';
import Refresh from './svg/Refresh.svg';
import Alert from './svg/Alert.svg';
import Reset from './svg/Reset.svg';
import Search from './New_svg/Search.svg';
import ListView from './New_svg/ListView.svg';
import IconView from './New_svg/IconView.svg';
import Directory from './New_svg/Directory.svg';
import Model from './New_svg/Model.svg';
import Motion from './New_svg/Motion.svg';
import Mocap from './New_svg/Mocap.svg';
import ArrowOpen from './New_svg/ArrowOpen.svg';
import ArrowClose from './New_svg/ArrowClose.svg';
import SimpleMode from './svg/SimpleMode.svg';
import TrackMode from './svg/TrackMode.svg';
import Record from './svg/Record.svg';
import Stop from './svg/Stop.svg';
import InsertKeyframe from './svg/InsertKeyframe.svg';
import Bezier from './svg/Bezier.svg';
import Linear from './svg/Linear.svg';
import Constant from './svg/Constant.svg';
import PauseVideo from './svg/PauseVideo.svg';
import EmptyDownArrow from './svg/EmptyDownArrow.svg';
import VideoRecord from './svg/VideoRecord.svg';
import Spinner from './svg/Spinner.svg';
import Body from './svg/Body.svg';
import NoCamera from './svg/NoCamera.svg';
import CheckThin from './svg/Check-thin.svg';
import Warning from './svg/Warning.svg';
import Logo from './New_svg/Logo.svg';
import Support from './New_svg/Support.svg';
import CloudUpload from './svg/CloudUpload.svg';
import ErrorWarning from './svg/ErrorWarning.svg';
import ModalClose from './svg/ModalClose.svg';
import CameraPlay from '../../../public/images/CameraPlay.svg';
import CameraRecord from '../../../public/images/CameraRecord.svg';
import CameraPause from '../../../public/images/CameraPause.svg';
import CameraStop from '../../../public/images/CameraStop.svg';
import Storage from './svg/Storage.svg';
import Credit from './svg/Credit.svg';
import WarningTriangle from './svg/WarningTriangle.svg';
import Link from './New_svg/Link.svg';
import Info from './New_svg/Info.svg';

type Icon =
  | 'ModalClose'
  | 'More'
  | 'Close'
  | 'Search'
  | 'EyeClose'
  | 'EyeOpen'
  | 'EyeOpenWhite'
  | 'LockClose'
  | 'LockOpen'
  | 'ListView'
  | 'IconView'
  | 'Plus'
  | 'CameraReset'
  | 'FilledArrow'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'ChevronUp'
  | 'ChevronDown'
  | 'BreadcrumbMore'
  | 'Layer'
  | 'Camera'
  | 'Dopesheet'
  | 'PlayArrow'
  | 'RewindArrow'
  | 'Pause'
  | 'Export'
  | 'PlayBar'
  | 'LineLeftTriangle'
  | 'CaretRight'
  | 'CaretDown'
  | 'Check'
  | 'Error'
  | 'Refresh'
  | 'Alert'
  | 'Reset'
  | 'Directory'
  | 'Model'
  | 'Motion'
  | 'Mocap'
  | 'SimpleMode'
  | 'Stop'
  | 'Record'
  | 'InsertKeyframe'
  | 'Bezier'
  | 'Linear'
  | 'Constant'
  | 'TrackMode'
  | 'PauseVideo'
  | 'EmptyDownArrow'
  | 'VideoRecord'
  | 'Spinner'
  | 'NoCamera'
  | 'ArrowOpen'
  | 'ArrowClose'
  | 'Body'
  | 'CheckThin'
  | 'Warning'
  | 'Logo'
  | 'Support'
  | 'CloudUpload'
  | 'ErrorWarning'
  | 'CameraPlay'
  | 'CameraRecord'
  | 'CameraPause'
  | 'CameraStop'
  | 'Credit'
  | 'Storage'
  | 'WarningTriangle'
  | 'Link'
  | 'Info';

type Images = {
  [key in Icon]: FunctionComponent<React.PropsWithChildren<unknown>>;
};

const images: Images = {
  Close,
  Search,
  EyeClose,
  More,
  EyeOpen,
  EyeOpenWhite,
  LockClose,
  LockOpen,
  ListView,
  IconView,
  Plus,
  CameraReset,
  FilledArrow,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BreadcrumbMore,
  Layer,
  Camera,
  Dopesheet,
  PlayArrow,
  RewindArrow,
  Pause,
  Export,
  PlayBar,
  LineLeftTriangle,
  CaretRight,
  CaretDown,
  Check,
  Error,
  Refresh,
  Alert,
  Reset,
  Directory,
  Model,
  Motion,
  Mocap,
  SimpleMode,
  Record,
  Stop,
  InsertKeyframe,
  Bezier,
  Linear,
  Constant,
  TrackMode,
  PauseVideo,
  EmptyDownArrow,
  VideoRecord,
  Spinner,
  NoCamera,
  ArrowOpen,
  ArrowClose,
  Body,
  CheckThin,
  Warning,
  Logo,
  Support,
  CloudUpload,
  ErrorWarning,
  ModalClose,
  CameraPlay,
  CameraRecord,
  CameraPause,
  CameraStop,
  Storage,
  Credit,
  WarningTriangle,
  Link,
  Info,
};

export default images;
