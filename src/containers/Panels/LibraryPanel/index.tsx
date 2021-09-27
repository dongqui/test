import _ from 'lodash';
import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';
import { FunctionComponent, memo, useEffect, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import { convertFBXtoGLB } from 'api';
import axios from 'axios';
import produce from 'immer';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import Box from 'components/Layout/Box';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {}

type Props = StateProps & BaseProps;

const LibraryPanel: FunctionComponent<Props> = ({ lpNode }) => {
  const getFileExtension = useCallback((file: string): string => {
    const type = (/[^./\\]*$/.exec(file) || [''])[0];

    return type;
  }, []);

  const dispatch = useDispatch();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { onModalOpen, onModalClose } = useBaseModal();

  const handleCreateNode = useCallback(() => {}, []);

  /**
   * LP에 drop하는 파일에 대한 확장자에 의한 1차 처리
   *
   * @param {File[]} files - LP에 drop하는 파일 (다중 또는 단일)
   */
  const handleDrop = useCallback(
    async (files: File[]) => {
      // 다중 or 단일 drop한 파일에 대해서 최종적으로 dispatch하기 위한 clone 처리
      let nextLPNodes = _.clone(lpNode);

      /**
       * .glb or .fbx는 LPNode에 연결 그 외 AlertModal을 통한 예외 처리
       *
       * @param file - LP에 drop한 파일
       * @todo 각 Folder, Model, Motion 등 이름수정을 위한 파일명과 파일확장자의 분리가 필요
       */
      const onFileLoad = async (file: File) => {
        // 대소문자 관련없이 처리하기 위한 확장자의 소문자 치환
        const extension = getFileExtension(file.name).toLowerCase();
        const fileName = file.name;

        switch (extension) {
          // 1) glb(GLB) 로드
          case 'glb': {
            const nextNodes = produce(nextLPNodes, (draft) => {
              const newNode = {
                id: uuidv4(),
                fileURL: file,
                name: fileName,
                type: 'Model',
              } as LP.Node;

              draft.push(newNode);
            });

            nextLPNodes = nextNodes;

            dispatch(
              lpNodeActions.changeNode({
                nodes: nextNodes,
              }),
            );

            break;
          }

          // 2) fbx(FBX) 로드
          case 'fbx': {
            onModalOpen({
              title: 'Importing the file',
              message: 'This can take up to 3 minutes',
            });

            await convertFBXtoGLB(file)
              .then((response) => {
                onModalClose();

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    fileURL: response,
                    name: fileName,
                    type: 'Model',
                  } as LP.Node;

                  draft.push(newNode);
                });

                nextLPNodes = nextNodes;

                dispatch(
                  lpNodeActions.changeNode({
                    nodes: nextNodes,
                  }),
                );
              })
              .catch(() => {
                onModalOpen({
                  title: 'Warning',
                  message:
                    '파일 변환 중 예기치 못한 에러가 발생했습니다.<br />계속하여 발생하는 경우 contact@plask.ai로 문의주세요.',
                  confirmText: 'Contact',
                  onConfirm: () => {
                    location.href = 'mailto:contact@plask.ai';
                  },
                });
              });

            break;
          }

          // 3) mp4(MP4), mov(MOV), avi(AVI) 로드
          case 'mp4':
          case 'mov':
          case 'avi': {
            console.log('동영상');
            // VM으로 전환
            break;
          }

          // 4) glb(GLB) or fbx(FBX) 외 로드
          default: {
            onModalOpen({
              title: 'Warning',
              message: 'Unsupported file format',
              confirmText: 'Close',
            });
            break;
          }
        }
      };

      // 순차적으로 파일 로드
      for (let i = 0; i < files.length; i++) {
        await onFileLoad(files[i]);
      }

      // handleDrop END
    },
    [dispatch, getFileExtension, lpNode, onModalClose, onModalOpen],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const [view, setView] = useState<LP.View>('List');

  // LP에서 기본 ContextMenu(우클릭) event disable
  // useEffect(() => {
  //   const handleContextMenu = (e: any) => {
  //     e.preventDefault();

  //     const isContains = wrapperRef.current?.contains(e.target as Node);
  //     if (!isContains) {
  //       // onContextMenuOpen({
  //       //   innerRef: wrapperRef,
  //       //   menu: [],
  //       // });
  //     }
  //   };

  //   const currentRef = wrapperRef.current;

  //   if (currentRef) {
  //     currentRef.addEventListener('contextmenu', handleContextMenu);

  //     return () => {
  //       currentRef.removeEventListener('contextmenu', handleContextMenu);
  //     };
  //   }
  // }, []);

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <div className={cx('inner')}>
        <Box id="LP-Header" noResize>
          <LPHeader />
        </Box>
        <Box id="LP-Controlbar" noResize>
          <LPControlbar />
        </Box>
        <Box id="LP-Body" className={cx('lp-body')} noResize>
          <LPBody view={view} lpNode={lpNode} />
        </Box>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    lpNode: state.lpNode.node,
  };
};

export default connect(mapStateToProps)(memo(LibraryPanel));
