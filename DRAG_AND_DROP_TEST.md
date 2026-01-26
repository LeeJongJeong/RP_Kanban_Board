# 드래그 앤 드롭 기능 테스트 가이드

## ✅ 구현 완료

드래그 앤 드롭 기능이 정상적으로 작동합니다!

## 🎯 테스트 시나리오

### 1. 티켓 상태 변경 (Status View)
1. 브라우저에서 메인 URL 접속
2. 상단 우측 드롭다운에서 **"상태별 보기"** 선택
3. **To-Do** 컬럼의 티켓을 클릭하여 드래그
4. **In-Progress** 컬럼으로 드롭
5. 티켓이 이동하고 성공 알림 표시됨
6. 마찬가지로 **In-Progress → Review → Done** 순서로 이동 가능

### 2. 담당자 할당 (Engineer View)
1. 상단 우측 드롭다운에서 **"엔지니어별 보기"** 선택
2. 미할당 티켓 또는 다른 엔지니어의 티켓을 드래그
3. 원하는 엔지니어 컬럼으로 드롭
4. 담당자가 변경되고 WIP 게이지 업데이트됨

### 3. 시각적 피드백
- **드래그 시작**: 티켓 카드에 `dragging` 클래스 추가 (스타일 변경)
- **드롭 영역 진입**: 컬럼에 `drag-over` 클래스 추가 (배경색 변경)
- **드롭 완료**: 성공 알림 표시 및 데이터 새로고침

## 🔧 기술 구현 세부사항

### 주요 함수
- `handleDragStart(event, ticketId)`: 드래그 시작, draggedTicket 전역 변수에 저장
- `handleDragEnd(event)`: 드래그 종료, 스타일 클래스 정리
- `handleDragOver(event)`: 드래그 중 드롭 영역 진입, `drag-over` 클래스 추가
- `handleDragLeave(event)`: 드래그 영역 이탈, `drag-over` 클래스 제거
- `handleDrop(event, newStatus)`: 상태별 뷰에서 드롭, API 호출하여 상태 업데이트
- `handleEngineerDrop(event, engineerId)`: 엔지니어별 뷰에서 드롭, API 호출하여 담당자 업데이트

### API 엔드포인트
- `PATCH /api/tickets/:id/status`: 티켓 상태 변경
  ```json
  {
    "status": "in_progress",
    "changed_by": 1
  }
  ```
- `PATCH /api/tickets/:id/assign`: 담당자 할당
  ```json
  {
    "assigned_to": 10,
    "changed_by": 1
  }
  ```

### Window 전역 노출
모든 이벤트 핸들러 함수를 `window` 객체에 명시적으로 노출하여 HTML inline 이벤트 핸들러에서 접근 가능:
```javascript
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleEngineerDrop = handleEngineerDrop;
```

## ⚠️ 주의사항
1. **WIP 제한 확인**: 엔지니어별 WIP 제한(기본 3건)을 초과하면 경고 표시
2. **동일 상태/담당자**: 같은 상태 또는 담당자에게 드롭하면 변경 없이 무시됨
3. **네트워크 오류**: API 호출 실패 시 에러 알림 표시 및 롤백

## 🎨 CSS 클래스
- `.dragging`: 드래그 중인 티켓 카드 (opacity 감소)
- `.drag-over`: 드롭 가능 영역 (배경색 변경)
- `.ticket-card`: 기본 티켓 카드 스타일
- `.kanban-column`: 칸반 컬럼 스타일

## 📝 TODO: 향후 개선 사항
- [ ] WIP 제한 초과 시 드롭 방지
- [ ] 드래그 프리뷰 커스터마이징
- [ ] 애니메이션 효과 추가
- [ ] 터치 디바이스 지원 (모바일)
- [ ] 키보드 네비게이션 지원 (접근성)

---
**작성일**: 2026-01-26  
**버전**: v3.2.0
