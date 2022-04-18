capture container flag variable state 정리
------

| recording | standbyState |  recordState  |  recordOverTwice  | State              |
|:---------:|:------------:|:-------------:|:-----------------:|--------------------|
|     X     |      X       |       X       |         X         | 녹화 전               |
|     O     |      O       |       X       |         X         | 녹화 버튼 누른 후 standby |
|     O     |      X       |       X       |         O         | 녹화 중               |
|     X     |      X       |       X       |         O         | 녹화 종료              |
|     X     |      X       |       O       |         O         | Thumbnail 생성 후     |

각 Flag의 Type은 `boolean`이며 O는 `True` X는 `False` 입니다.
