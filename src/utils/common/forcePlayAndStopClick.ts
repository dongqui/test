/**
 * MB의 play와 stop 버튼 클릭 이벤트를 강제로 호출합니다.
 * 컨트롤러 생성 시에 모델의 첫 모습과 같은 위치에 있도록 하기 위해 사용합니다.
 *
 */
function forcePlayAndStopClick() {
  setTimeout(() => {
    document.getElementById('play')?.click();
    setTimeout(() => {
      document.getElementById('stop')!.click();
    }, 0);
  }, 0);
}

export default forcePlayAndStopClick;
