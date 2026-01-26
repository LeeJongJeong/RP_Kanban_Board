# 모달 위치 조정 로그

## 문제 발생
**일시**: 2026-01-26  
**증상**: 대시보드 모달의 윗부분이 잘려서 보이는 현상

## 원인 분석

### 1. 중앙 정렬 문제
- 기존: `items-center` - 컨텐츠가 화면 중앙에 배치
- 문제: 모달 높이가 클 때 상단이 화면 밖으로 벗어남

### 2. 최대 높이 설정
- 기존: `max-h-[95vh]` (모바일), `max-h-[90vh]` (데스크톱)
- 문제: 화면 높이의 대부분을 차지하여 상단/하단 여백 부족

### 3. 여백 부족
- 기존: 패딩만 설정 (`p-2 sm:p-4`)
- 문제: 모달 컨텐츠 박스 자체의 상하 여백 없음

## 해결 방법

### 1. 상단 정렬로 변경
```html
<!-- Before -->
<div class="... items-center justify-center ...">

<!-- After -->
<div class="... items-start justify-center overflow-y-auto ...">
```

**효과**:
- 모달이 화면 상단부터 표시
- 스크롤 시 항상 상단부터 볼 수 있음

### 2. 최대 높이 조정
```html
<!-- Before -->
max-h-[95vh] sm:max-h-[90vh]

<!-- After -->
max-h-[85vh] sm:max-h-[85vh]
```

**효과**:
- 상하 여백 확보 (총 15vh)
- 화면에 꽉 차지 않아 잘림 현상 방지

### 3. 상하 여백 추가
```html
<!-- Before -->
<div class="bg-white rounded-lg ...">

<!-- After -->
<div class="bg-white rounded-lg ... my-4 sm:my-8">
```

**효과**:
- 모바일: 상하 각 1rem (16px) 여백
- 데스크톱: 상하 각 2rem (32px) 여백

### 4. 외부 스크롤 추가
```html
<!-- Before -->
<div class="... flex items-center justify-center ...">

<!-- After -->
<div class="... flex items-start justify-center overflow-y-auto ...">
```

**효과**:
- 모달 배경 자체에서 스크롤 가능
- 모달 내부 스크롤과 이중 보호

## 적용 모달

모든 모달에 일관되게 적용:

1. ✅ **대시보드 모달** (`#dashboardModal`)
2. ✅ **티켓 생성 모달** (`#newTicketModal`)
3. ✅ **티켓 상세 모달** (`#ticketDetailModal`)
4. ✅ **SLA 위험 모달** (`#slaRiskModal`)
5. ✅ **주차 선택 모달** (`#weekPickerModal`)

## 변경 전후 비교

| 항목 | Before | After |
|------|--------|-------|
| 세로 정렬 | `items-center` | `items-start` |
| 최대 높이 | `95vh/90vh` | `85vh` |
| 여백 | 없음 | `my-4 sm:my-8` |
| 외부 스크롤 | 없음 | `overflow-y-auto` |

## 테스트 결과

### ✅ 데스크톱 (1920x1080)
- 대시보드 상단 완전히 표시됨
- 스크롤 시 자연스러운 동작
- 닫기 버튼 항상 접근 가능

### ✅ 태블릿 (768x1024)
- 세로 모드에서도 상단 잘림 없음
- 충분한 상하 여백

### ✅ 모바일 (375x667)
- 작은 화면에서도 상단 완전 표시
- 스크롤 동작 자연스러움

## 부작용 및 주의사항

### 없음 ✅
- 모든 화면 크기에서 정상 작동
- 기존 기능에 영향 없음
- 사용자 경험 향상

## 관련 커밋

```bash
[main 219d6e8] fix: 모달 위치 조정 - 상단이 잘리지 않도록 items-start 및 여백 추가
1 file changed, 15 insertions(+), 15 deletions(-)
```

## 추가 개선 제안

### 향후 고려사항
1. **애니메이션 추가**: 모달 열릴 때 슬라이드 효과
2. **키보드 네비게이션**: ESC 키로 모달 닫기
3. **포커스 트랩**: 모달 내에서만 탭 이동
4. **배경 스크롤 방지**: 모달 열릴 때 body 스크롤 잠금

---

**작성자**: 디사피엔스  
**작성일**: 2026-01-26  
**버전**: v3.4.1
