import styled from 'styled-components';

interface TreeRowStyleProps {
  clicked?: boolean;
  visible?: boolean;
  width?: string;
}

const handlebackgroundcolor = (clicked: boolean | undefined, visible: boolean | undefined) => {
  if (clicked) {
    switch (clicked) {
      case true:
        return `var(--gray400)`;
      default:
        return `var(--gray100)`;
    }
  } else if (visible) {
    switch (visible) {
      case true:
        return `var(--vivid-blue)`;
    }
  }
};

export const Wrapper = styled.div<TreeRowStyleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width ?? '100%'};
  height: 2rem;
  border-radius: ${(props) => (props.clicked ? `` : '0.5rem')};
  padding: 4px 0 4px 0;
  background-color: ${(props) => handlebackgroundcolor(props.clicked, props.visible)};
  transform: translate(0, 0);
  transition: background 0.2s ease, color 0.1s ease, box-shadow 0.2s ease;

  :hover {
    box-shadow: inset 0 0 0 2px var(--vivid-blue);
    transition: background 0.2s ease, color 0.1s ease, box-shadow 0.2s ease;
  }
  user-select: none;
`;

export const FileInfo = styled.div`
  display: inline-flex;
`;

export const FileIcon = styled.div`
  margin-left: 21%;
`;

export const FileName = styled.span`
  width: 50%;
  line-height: 22px;
  margin-left: 6%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--gray700);
`;
