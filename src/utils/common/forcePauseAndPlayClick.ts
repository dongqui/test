import { PlayDirection, PlayState } from 'types/RP';

/**
 * 애니메이션 재생 도중 mute/unmute, 키프레임 추가/삭제/드랍/복사 등, 애니메이션 데이터를 변경시키는 이벤트가 발생 할 때
 * MB의 pause와 play/rewind 버튼 클릭 이벤트를 강제로 호출합니다.
 * 클릭 이벤트를 강제로 호출시키면서, 재생 도중에 변경 된 애니메이션 데이터를 적용시킵니다.
 *
 * @param _playState 현재 애니메이션의 재생 상태
 * @param _playDirection 현재 애니메이션의 진행 방향
 * @returns void
 */
function forcePauseAndPlayClick(_playState: PlayState, _playDirection: PlayDirection) {
  if (_playState === 'play') {
    document.getElementById('pause')!.click();
    setTimeout(() => {
      document.getElementById(_playDirection === PlayDirection.forward ? 'play' : 'rewind')?.click();
    }, 0);
  }
}

export default forcePauseAndPlayClick;
