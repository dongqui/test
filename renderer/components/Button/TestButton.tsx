import { FunctionComponent, memo } from 'react';

export interface TestButtonProps {
  text?: string;
}

const defaultProps: Partial<TestButtonProps> = {
  text: 'Test Button',
};

const TestButton: FunctionComponent<TestButtonProps> = ({
  text,
}) => {
  return (
    <button>
      {text}
    </button>
  );
};

TestButton.defaultProps = defaultProps;

export default memo(TestButton);