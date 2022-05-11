import { Fragment, useMemo, useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import _IconButton from './';
import { useDropzone } from 'react-dropzone';

import { SvgPath } from 'components/Icon';

export default {
  component: _IconButton,
} as ComponentMeta<typeof _IconButton>;

const Template: ComponentStory<typeof _IconButton> = (args) => <_IconButton {...args} />;
export const IconButton = Template.bind({});

IconButton.args = {
  variant: 'default',
  disabled: false,
  icon: SvgPath.Search,
};

const SelectIconTemplate: ComponentStory<typeof _IconButton> = (args) => {
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof SvgPath>('EyeOpen');

  return (
    <Fragment>
      <h2 style={{ color: '#afb2b6' }}>Dropdown을 이용하여 현재 서비스에서 사용하고 있는 아이콘 모양을 확인해 볼 수 있습니다.</h2>
      <_IconButton {...args} icon={SvgPath[selectedIcon]} />
      <br />
      <select defaultValue={selectedIcon} onKeyDown={(e) => e.preventDefault()} onChange={(e) => setSelectedIcon(e.currentTarget.value as keyof typeof SvgPath)}>
        {Object.keys(SvgPath).map((icon) => (
          <option key={icon}>{icon}</option>
        ))}
      </select>
    </Fragment>
  );
};
export const ExistingIcon = SelectIconTemplate.bind({});

ExistingIcon.args = {
  variant: 'default',
  disabled: false,
};

const NewIconTestTemplate: ComponentStory<typeof _IconButton> = (args) => {
  const [svg, setSvg] = useState('');
  const [color, setColor] = useState('#000000');
  const [toggle, setToggle] = useState(true);

  const handleDrop = async (files: File[]) => {
    const svgFiles = files.filter((file) => file.type.includes('image/svg+xml'));

    if (svgFiles.length === 0) {
      alert('no SVG File detected.');
    } else {
      const svgFile = svgFiles[0];
      const svgText = await svgFile.text();
      setSvg(svgText);
    }
  };
  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const SVGComponent = useMemo(() => {
    return function _SVG() {
      const svgText = svg;
      const svgTextColored = svgText
        .replace(/(stroke=")(?!none)(#[\da-fA-F]{6}|[a-zA-Z]*)(")/g, `$1${color}$3`)
        .replace(/(fill=")(?!none)(#[\da-fA-F]{6}|[a-zA-Z]*)(")/g, `$1${color}$3`);
      const svgData = new Blob([toggle ? svgTextColored : svgText], { type: 'image/svg+xml' });
      const svgURL = URL.createObjectURL(svgData);

      return (
        <img
          src={svgURL}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            userSelect: 'none',
          }}
        />
      );
    };
  }, [color, svg, toggle]);

  return (
    <Fragment>
      <h2 style={{ color: '#afb2b6' }}>임의의 SVG 파일을 drop 하여 component를 확인할 수 있습니다.</h2>
      <h6 style={{ color: '#afb2b6' }}>(강제 색상 변경 방식이기에 일부 svg는 color option을 제거해야 합니다!)</h6>
      <_IconButton {...args} icon={!!svg ? SVGComponent : SvgPath.Support} />
      <br />
      <div style={{ position: 'relative', height: '100px', border: 'dashed 1px white', color: 'white', fontSize: '2rem' }} {...getRootProps()}>
        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', userSelect: 'none' }}>Drop SVG File</span>
      </div>
      <br />
      {!!svg && (
        <div style={{ color: '#afb2b6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>current SVG: </span>
          <SVGComponent />
          <span style={{ margin: '0 10px' }}>current Color: </span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <span style={{ margin: '0 10px' }}>apply color option: </span>
          <input type="checkbox" checked={toggle} onChange={(e) => setToggle(e.target.checked)} />
        </div>
      )}
    </Fragment>
  );
};
export const NewIcon = NewIconTestTemplate.bind({});

NewIcon.args = {
  variant: 'default',
  disabled: false,
};
