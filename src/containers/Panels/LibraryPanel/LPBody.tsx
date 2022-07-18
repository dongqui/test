import { FunctionComponent, memo, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import * as globalUIActions from 'actions/Common/globalUI';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import ListNode from './ListView/ListNode';

import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  lpNodes?: LP.Node[];
  isPreventContextmenu?: boolean;
}

const LPBody: FunctionComponent<Props> = ({ lpNodes }) => {
  const dispatch = useDispatch();
  const { nodes, draggedNode } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
    dispatch(
      globalUIActions.openContextMenu('LPBodyContextMenu', e, {
        nodeId: '',
      }),
    );
  };

  const handleClick = () => {
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
  };

  const handleDrop = () => {
    if (!draggedNode?.parentId || draggedNode.type === 'MOTION') {
      return;
    }

    dispatch(lpNodeActions.moveNodeSocket.request(''));
  };

  const innerRef = useRef<HTMLDivElement>(null);
  const [scrollHandleY, setScrollHandleY] = useState(0);
  const prevScrollY = useRef(0);

  const [goingUp, setGoingUp] = useState(false);

  const [scrollHandleHeight, setScrollHandleHeight] = useState(0);
  const [isScrollHidden, setIsScrollHidden] = useState(true);

  useEffect(() => {
    const currentRef = innerRef.current;
    const libraryPanel = document.getElementById('LP-Body');

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;

      if (target) {
        const currentScrollY = target.scrollTop;
        console.log(target.scrollTop);

        if (prevScrollY.current < currentScrollY) {
          setScrollHandleY(prevScrollY.current);
        }

        if (prevScrollY.current > currentScrollY) {
          setScrollHandleY(currentScrollY);
        }

        prevScrollY.current = currentScrollY;
      }
    };

    const contentResizeObserver = new ResizeObserver(() => {
      if (currentRef && libraryPanel) {
        const panelHeight = libraryPanel.offsetHeight;
        const contentHeight = currentRef.scrollHeight;

        const ratio = panelHeight / contentHeight;
        const handleHeight = panelHeight * ratio;

        setIsScrollHidden(ratio >= 1);
        setScrollHandleHeight(handleHeight);
      }
    });

    if (currentRef && libraryPanel) {
      contentResizeObserver.observe(currentRef);

      for (var i = 0; i < currentRef.children.length; i++) {
        contentResizeObserver.observe(currentRef.children[i]);
      }

      currentRef.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        contentResizeObserver.unobserve(currentRef);
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollHandleY]);

  const rootPathNodes = (lpNodes ?? nodes).filter((node) => !node.parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className={cx('inner')} onContextMenu={handleContextMenu} onClick={handleClick} onDrop={handleDrop} data-cy="lp-body">
      <div className={cx('content')} ref={innerRef}>
        <div className={cx('onboarding-export-file-target')} id={ONBOARDING_ID.EXPORT_FILE} />
        <div className={cx('onboarding-apply-motion-target')} id={ONBOARDING_ID.APPLY_MOTION} />
        {rootPathNodes.map((node) => (
          <div className={cx('node-row')} key={node.id}>
            <ListNode node={node} />
          </div>
        ))}
        <div className={cx('scrollbar-wrapper')}>
          <div className={cx('scrollbar-track')}>
            <div
              className={cx('scrollbar-handle')}
              style={{ display: isScrollHidden ? 'none' : 'block', height: `${scrollHandleHeight}px`, transform: `translateY(${scrollHandleY}px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LPBody);
