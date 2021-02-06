import React, { useState } from 'react';
import * as S from './TreeViewStyles';
import { TreeRow } from '..';
import { CaretDownMedium, ModelCharacter, ModelCircle } from '../../Icons';

export interface TreeViewProps {
  visible?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({ visible = false }) => {
  const [menuClicked, setMenuClicked] = useState(true);
  const [clicked, setClicked] = useState(false);
  return (
    <S.Wrapper clicked={clicked} visible={visible}>
      <S.DropDown onClick={() => setMenuClicked(!menuClicked)}>
        <CaretDownMedium
          fillColor={`var(--gray700)`}
          style={{ display: 'inline-flex', marginLeft: '2%' }}
        />
        <ModelCharacter fillColor={`var(--gray700)`} style={{ display: 'inline-flex' }} />
        <S.ActionName>Hello</S.ActionName>
      </S.DropDown>
      <S.Content clicked={menuClicked}>
        {/* 해당 부분은 임시적으로 보이기 위한 부분으로 수정될 예정 */}
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="action1" />
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="maxixas.com" />
        <TreeRow
          key={1}
          id="1"
          prefix={<ModelCircle />}
          fileName="Attack"
          clicked={clicked}
          visible={visible}
          onClick={() => setClicked(!clicked)}
        />
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="Protect" />
      </S.Content>
    </S.Wrapper>
  );
};
