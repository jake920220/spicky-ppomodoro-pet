---
phase: 01
reviewers: [gemini]
reviewed_at: 2026-03-28T12:41:24+09:00
plans_reviewed:
  - 01-01-PLAN.md
  - 01-02-PLAN.md
  - 01-03-PLAN.md
notes:
  - "Gemini OAuth was configured during this run via ~/.gemini/settings.json."
  - "Claude CLI review was unavailable because only the cmux wrapper was present and no real claude binary was found in PATH."
  - "Codex CLI was intentionally skipped to keep the external review independent of the active runtime."
---

# Cross-AI Plan Review — Phase 01

## Gemini Review

"스피키 뽀모도로 펫(Spiky Ppomodoro pet)" 프로젝트의 **Phase 01: Overlay Shell Foundation** 구현 계획에 대한 검토 결과를 정리해 드립니다.

### 1. 요약 (Summary)
본 계획은 데스크톱 펫이라는 제품의 정체성을 시각적, 기술적으로 확립하는 데 매우 충실합니다. 특히 Tauri 2의 창 제어 API를 활용하여 "중앙 팝업 후 이동" 현상을 방지하는 **'숨김 후 배치(Hidden-first)'** 전략은 사용자 경험의 완성도를 높이는 핵심적인 접근입니다. 코드 구조 면에서도 네이티브 쉘 로직과 UI 렌더링을 명확히 분리하여 아키텍처 원칙을 잘 준수하고 있습니다.

### 2. 강점 (Strengths)
* **사용자 경험 세심함**: 단순히 창을 띄우는 것이 아니라, 모니터의 `workArea`(작업 표시줄 제외 영역)를 계산하여 하단에 배치하고 표시하는 로직을 통해 "바탕화면 펫"다운 첫인상을 보장합니다.
* **플랫폼 별 함정 파악**: Windows에서 undecorated 창에 `shadow: true` 적용 시 발생하는 흰색 테두리 문제나, `visibleOnAllWorkspaces`의 플랫폼 제한 사항을 연구 단계에서 미리 파악하여 위험을 제거했습니다.
* **견고한 오류 처리**: Phase 1임에도 불구하고 이미지 에셋 로딩 실패에 대비한 폴백(`showImageFallback`) 로직을 포함하여 안정적인 시동을 고려했습니다.
* **명확한 의존성 관리**: 계획 01-01부터 01-03까지 논리적인 순서로 구성되어 있으며, 각 단계의 성공 기준이 구체적입니다.

### 3. 우려 사항 (Concerns)
* **드래그 영역의 사각지대 (Severity: MEDIUM)**
  조사 내용(Pitfall 2)에서 언급했듯이, `data-tauri-drag-region`은 해당 속성이 직접 부여된 요소에만 작동합니다. 계획 01-02에서 핸들에 속성을 부여하지만, 핸들 내부의 제목이나 아이콘 같은 자식 요소들에도 속성을 전파하지 않으면 사용자가 글자를 클릭해 드래그할 때 창이 움직이지 않는 '데드 존'이 발생할 수 있습니다.
* **창 크기와 레이아웃의 불일치 (Severity: LOW)**
  `tauri.conf.json`에서 정의한 창 크기(340x460)와 CSS에서 설정한 `.app-shell`의 최대 너비(310px) 사이에 차이가 있습니다. 투명 창이므로 시각적으론 문제가 없으나, 드래그 핸들이 실제 창의 가로 전체를 채우지 않을 경우 클릭 영역이 예상보다 좁게 느껴질 수 있습니다.
* **Windows 환경 검증 누락 (Severity: LOW)**
  현재 개발 환경이 macOS이므로 Windows 특유의 쉘 동작(작업 표시줄 위치에 따른 배치 등)을 즉시 검증하기 어렵습니다. 이는 Phase 4로 미뤄져 있으나, Phase 1의 배치 로직이 Windows에서도 유연하게 작동하는지 조기 확인이 필요할 수 있습니다.

### 4. 제안 사항 (Suggestions)
* **드래그 속성 전파 자동화**: `ui.ts`에서 `drag-handle`을 생성할 때, 내부의 텍스트(`span`) 요소들에도 `data-tauri-drag-region`을 명시적으로 포함하도록 태스크 설명을 수정하거나, 필요시 manual `startDragging()` 방식으로 전환하는 것을 권장합니다.
* **모니터 경계값 상수화**: `WINDOW_BOTTOM_MARGIN_PX` 외에도 하단 배치를 위한 '안전 영역' 수치들을 상수로 관리하여, 향후 윈도우 크기 변경 시에도 일관된 배치를 유지하도록 하십시오.
* **초기 렌더링 순서 보정**: 계획 01-03에서 `image_1`을 로드하기 전에 아주 짧은 시간 동안 빈 창이 보일 수 있습니다. CSS에 아주 연한 배경색이나 스켈레톤 처리를 일시적으로 적용하는 것을 고려해 볼 수 있습니다.

### 5. 위험 평가 (Risk Assessment): LOW
전반적인 위험도는 **낮음**입니다. Tauri 2의 표준 기능을 안정적으로 사용하고 있으며, 연구 단계에서 주요 기술적 난관들을 이미 해결했습니다. 드래그 영역 설정 시 자식 요소들에 대한 처리만 주의한다면 Phase 1의 목표를 무난히 달성할 수 있을 것으로 보입니다.

---

## Consensus Summary

This run had one external reviewer only, so the synthesis below is limited to Gemini's review plus orchestration notes.

### Agreed Strengths

* Hidden-first lower-area placement is the right UX target for a desktop-pet shell.
* The Phase 1 plan breakdown is disciplined and keeps shell, layout, and idle-state work separated.
* The plan already considers asset fallback and platform-specific shell quirks early.

### Agreed Concerns

* Drag behavior needs explicit validation so the handle does not end up with dead zones or unnecessary permission creep.
* Windows-specific placement behavior is still under-validated for a phase that claims cross-platform shell correctness.

### Divergent Views

* Gemini's review assumes the hidden-first startup approach is part of the implemented path. That assumption should be verified against the actual code before treating the startup UX risk as closed.
