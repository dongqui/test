import _ from 'lodash';
import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';
import { FunctionComponent, useEffect, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import produce from 'immer';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import Box from 'components/Layout/Box';
import BaseModal, { useBaseModal } from 'new_components/Modal/BaseModal';
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

  const { onModalOpen, onModalClose } = useBaseModal();

  const handleCreateNode = useCallback(() => {}, []);

  const onConvertFBXtoGLB = useCallback(async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', 'fbx');
    formData.append('id', String(Date.now() / 1000));

    const result = await axios({
      method: 'POST',
      baseURL: 'https://blenderapi.myplask.com:5000',
      url: '/fbx2glb-upload-api',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((response) => {
      return response;
    });

    return result;
  }, []);

  /**
   * LP에 drop하는 파일에 대한 확장자에 의한 '1차' 처리
   *
   * @param {File[]} files - LP에 drop하는 파일 (다중 또는 단일)
   */
  const handleDrop = useCallback(
    async (files: File[]) => {
      let nextLPNodes = _.clone(lpNode);

      files.map(async (file) => {
        /**
         * @todo 추후 이름변경을 위해 fileName에서 확장자를 제거하여 별도 보관이 필요
         */
        const extension = getFileExtension(file.name).toLowerCase();

        switch (extension) {
          case 'glb': {
            const fileName = file.name;

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
          case 'fbx': {
            onModalOpen({
              title: 'Importing the file',
              message: 'This can take up to 3 minutes',
            });

            const { fileURL, isSuccess } = await onConvertFBXtoGLB(file).then((response: any) => {
              onModalClose();

              return {
                fileURL: response.data.result,
                isSuccess: true,
              };
            });

            if (isSuccess) {
              const fileName = file.name;

              const nextNodes = produce(nextLPNodes, (draft) => {
                const newNode = {
                  id: uuidv4(),
                  fileURL: fileURL,
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
            }

            break;
          }
          default: {
            onModalOpen({
              title: 'Warning',
              message: 'Unsupported file format',
              confirmText: 'Close',
            });
            break;
          }
        }
      });
    },
    [dispatch, getFileExtension, lpNode, onConvertFBXtoGLB, onModalClose, onModalOpen],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  // ListView or GalleryView
  const [view, setView] = useState<LP.View>('List');

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <Box id="LP-Header" noResize>
        <LPHeader />
      </Box>
      <Box id="LP-Controlbar" noResize>
        <LPControlbar />
      </Box>
      <Box id="LP-Body" className={cx('lp-body')} noResize>
        <LPBody view={view} nodes={lpNode} />
      </Box>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    lpNode: state.lpNode.node,
  };
};

export default connect(mapStateToProps)(LibraryPanel);
