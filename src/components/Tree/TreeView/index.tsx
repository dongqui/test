import React, { useState } from 'react';
import * as S from './TreeViewStyles';
import { TreeRow } from '..';
import { CaretDownMedium, ModelCharacter, ModelCircle } from '../../Icons';

export const TreeView: React.FC<{}> = () => {
  const [menuClicked, setMenuClicked] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [visible, setvisible] = useState(false);
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
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="action1" />
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="maxixas.com" />
        <TreeRow
          key={1}
          id="1"
          prefix={<ModelCircle />}
          fileName="Attack"
          clicked={clicked}
          onClick={() => setClicked(!clicked)}
        />
        <TreeRow key={1} id="1" prefix={<ModelCircle />} fileName="Protect" />
      </S.Content>
    </S.Wrapper>
  );
};
