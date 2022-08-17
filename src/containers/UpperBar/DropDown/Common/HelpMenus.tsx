import { useDispatch } from 'react-redux';

import { Dropdown } from 'components';
import { RootState, useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';

export default function HelpMenus() {
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const dispatch = useDispatch();

  function handleClickOnboarding() {
    dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
  }
  // contact : mailto - support@plask.ai reset onboarding - onboarding 리셋 기능 버튼

  return (
    <>
      <Dropdown.Item menuItem="Onboarding">
        <a href="https://knowledge.plask.ai/" rel="noopener noreferrer" target="_blank">
          Help center
        </a>
      </Dropdown.Item>
      <Dropdown.Item menuItem="Onboarding">
        <a href="www.youtube.com/watch?v=pzpbS5G71MU&list=PLvYxc99tMa7WKnQJETPKB_5niLXB2nGb5" rel="noopener noreferrer" target="_blank">
          YouTube tutorials
        </a>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item menuItem="Onboarding">
        <a href="https://knowledge.plask.ai/kb-tickets/new" rel="noopener noreferrer" target="_blank">
          Submit feedback
        </a>
      </Dropdown.Item>
      <Dropdown.Item menuItem="Onboarding">
        <a href="mailto:support@plask.ai" target="_blank" rel="noreferrer">
          Contact support
        </a>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item menuItem="Onboarding" onClick={handleClickOnboarding} disabled={mode !== 'animationMode'}>
        Reset onboarding
      </Dropdown.Item>
    </>
  );
}
