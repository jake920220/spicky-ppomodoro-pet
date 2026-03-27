# Spiky Ppomodoro pet

Spiky Ppomodoro pet은 macOS와 Windows에서 동작하는 데스크톱 펫 타이머 앱입니다.

캐릭터는 바탕화면 위에 표시되며, 준비된 투명 PNG 3장을 사용합니다.

- image_1: 기본 상태 (걸어다님)
- image_2: 클릭 상호작용 상태 (MP3 1 재생)
- image_3: 타이머 종료 알림 상태 (MP3 2 재생)

앱은 뽀모도로 스타일 타이머를 지원합니다.
클릭 시 MP3 음원 1이 재생됩니다.
타이머가 끝나면 준비된 MP3 음원 2가 재생됩니다.

기술 방향:

- Tauri 2
- Vanilla TypeScript
- pnpm

현재 범위 제외:

- LLM 연동
- 온라인 API
- 백엔드
- 모바일 지원
