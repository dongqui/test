import { useReactiveVar } from '@apollo/client';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import { ListRow } from './ListRow';
import * as S from './ListTreeStyles';

export interface ListViewProps {
  width: string;
  height: string;
}

const ListViewComponent: React.FC<ListViewProps> = ({ width, height }) => {
  const mainData = useReactiveVar(MAIN_DATA);
  return (
    <S.ListViewWrapper width={width} height={height}>
      {_.map(mainData, (item, index) => (
        <div key={index}>
          <ListRow
            mode={item.isChild ? 'file' : 'folder'}
            name="Model"
            isExpanded={item.isExpanded}
            isSelected={item.isSelected}
          />
          {_.map(item?.motions ?? [], (motion) => (
            <ListRow mode="motion" name={motion.name} />
          ))}
        </div>
      ))}
    </S.ListViewWrapper>
  );
};
export const ListView = React.memo(ListViewComponent);
