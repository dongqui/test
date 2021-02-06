import styled from '@emotion/styled';

interface TreeViewStyleProps {
  clicked?: boolean;
  visible?: boolean;
}

interface DropDownStyleProps {
  clicked?: boolean;
}

const handleBackgroundColor = (clicked: boolean | undefined, visible: boolean | undefined) => {
  if (clicked) {
    switch (clicked) {
      case true:
        return `var(--gray200)`;
      default:
        return `var(--gray100)`;
    }
  } else if (visible) {
    switch (visible) {
      case true:
        return `rgba(55, 133, 247, 0.2)`;
    }
  } else {
    return `var(--gray100)`;
  }
};

export const Wrapper = styled.div<TreeViewStyleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 206px;
  height: 100%;
  border-radius: 0.5rem;
  padding: 8px 0 0 0;
  background-color: ${(props) => handleBackgroundColor(props.clicked, props.visible)};
  transition: background 0.2s ease, color 0.1s ease, box-shadow 0.2s ease;
  user-select: none;
`;

export const DropDown = styled.div`
  position: relative;
  display: inline-flex;
  height: 2rem;
`;

export const Content = styled.div<DropDownStyleProps>`
  display: ${(props) => (props.clicked ? null : 'none')};
`;

export const ActionName = styled.div`
  width: 50%;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--gray700);
`;
