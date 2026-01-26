# 모바일 최적화 가이드

## 개요
RP Kanban Board를 모바일 환경에 최적화하여 스마트폰과 태블릿에서 원활한 사용자 경험을 제공합니다.

**작성일**: 2026-01-26  
**버전**: v3.4.0

---

## 주요 개선 사항

### 1. 반응형 헤더 디자인

#### 데스크톱 (≥640px)
- 타이틀 + 주차 선택 + 새 티켓 버튼 + 뷰 선택 + 대시보드 버튼이 한 줄에 배치
- 충분한 여백과 명확한 버튼 크기

#### 모바일 (<640px)
- **햄버거 메뉴**: 우측 상단에 메뉴 토글 버튼
- **모바일 메뉴**: 접고 펼칠 수 있는 메뉴 패널
  - 주차 선택 (전체 폭)
  - 새 티켓 / 대시보드 버튼 (2열 그리드)
  - 뷰 선택 드롭다운 (전체 폭)
- 타이틀 크기 조정: `text-2xl` → `text-lg`

```html
<!-- 모바일 메뉴 토글 버튼 -->
<button onclick="toggleMobileMenu()" class="sm:hidden text-gray-600">
  <i class="fas fa-bars text-xl"></i>
</button>

<!-- 모바일 메뉴 -->
<div id="mobileMenu" class="hidden sm:hidden mt-3 space-y-2">
  <!-- 주차 선택, 버튼, 뷰 선택 -->
</div>
```

---

### 2. 칸반 보드 레이아웃

#### 상태별 보기
- **데스크톱**: 4열 그리드 (`lg:grid-cols-4`)
- **태블릿**: 2열 그리드 (`sm:grid-cols-2`)
- **모바일**: 1열 스택 (`grid-cols-1`)

```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

#### 엔지니어별 보기 / DBMS별 보기
- **데스크톱**: 4열 (`xl:grid-cols-4`)
- **태블릿**: 3열 (`lg:grid-cols-3`)
- **모바일**: 1열 (`grid-cols-1`)

```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

#### 최소 폭 설정
모바일에서 가독성 유지를 위해 칸반 컬럼 최소 폭 설정:
```css
min-w-[280px] sm:min-w-0
```

---

### 3. 티켓 카드 최적화

#### 텍스트 크기 조정
```css
/* 심각도/DBMS 뱃지 */
text-[10px] sm:text-xs

/* 제목 */
text-sm sm:text-base

/* 본문 아이콘 및 텍스트 */
text-[10px] sm:text-xs
```

#### 여백 조정
```css
/* 카드 패딩 */
p-2 sm:p-3

/* 요소 간 간격 */
space-x-1 sm:space-x-2
mb-1 sm:mb-2
```

#### 텍스트 말줄임
```css
/* 한 줄 말줄임 */
truncate

/* 두 줄 말줄임 */
line-clamp-2
```

---

### 4. 모달 최적화

#### 공통 개선
- **패딩**: `p-2 sm:p-4` - 모바일에서 좌우 여백 최소화
- **최대 높이**: `max-h-[95vh] sm:max-h-[90vh]` - 모바일에서 더 많은 공간 활용
- **전체 폭**: `w-full` - 모바일에서 전체 화면 활용

#### 새 티켓 생성 모달
- 폼 필드 그리드를 1열로 변경:
```css
grid-cols-1 sm:grid-cols-2  /* DBMS 유형 / 작업 카테고리 */
grid-cols-1 sm:grid-cols-3  /* 호스트 IP / 환경 / 버전 */
```

#### 티켓 상세 모달
- 제목 크기: `text-xl sm:text-2xl`
- 패딩: `p-4 sm:p-6`

#### SLA 위험 모달
- 아이콘 크기: `text-2xl sm:text-3xl`
- 제목 크기: `text-xl sm:text-2xl`

---

### 5. 터치 이벤트 지원

모바일에서 드래그 앤 드롭 기능을 위한 터치 이벤트 핸들러 추가:

```javascript
// 터치 시작
function handleTouchStart(event, ticketId) {
  touchTicketId = ticketId;
  touchElement = event.currentTarget;
  // 시각적 피드백
  touchElement.classList.add('opacity-75', 'scale-95');
}

// 터치 이동
function handleTouchMove(event) {
  event.preventDefault(); // 스크롤 방지
  // 드래그 거리 계산 (최소 20px)
}

// 터치 종료
function handleTouchEnd(event) {
  // 드롭 타겟 찾기 및 상태/담당자 변경
  // 초기화
}
```

티켓 카드에 터치 이벤트 속성 추가:
```html
<div class="ticket-card"
     ontouchstart="handleTouchStart(event, ticketId)"
     ontouchmove="handleTouchMove(event)"
     ontouchend="handleTouchEnd(event)">
```

---

### 6. 알림 최적화

```css
/* 알림 위치 및 크기 */
fixed top-4 right-4
px-4 sm:px-6 py-2 sm:py-3
text-sm sm:text-base
max-w-sm  /* 모바일에서 최대 폭 제한 */
```

---

### 7. 뷰 모드 / 주차 선택 동기화

데스크톱과 모바일 셀렉터가 자동 동기화되도록 개선:

```javascript
function changeView() {
  const viewMode = document.getElementById('viewMode') || 
                   document.getElementById('viewModeMobile');
  currentView = viewMode.value;
  
  // 다른 셀렉터 동기화
  const otherViewMode = viewMode.id === 'viewMode'
    ? document.getElementById('viewModeMobile')
    : document.getElementById('viewMode');
  
  if (otherViewMode) {
    otherViewMode.value = currentView;
  }
  
  renderKanbanBoard();
}
```

주차 선택도 동일하게 동기화.

---

## 반응형 브레이크포인트

Tailwind CSS 기본 브레이크포인트 사용:

| 브레이크포인트 | 최소 폭 | 설명 |
|---------------|--------|------|
| `sm` | 640px | 태블릿 세로 |
| `md` | 768px | 태블릿 가로 |
| `lg` | 1024px | 노트북 |
| `xl` | 1280px | 데스크톱 |

---

## 테스트 시나리오

### 모바일 (320px ~ 480px)
- [ ] 헤더 햄버거 메뉴 정상 작동
- [ ] 모바일 메뉴 토글 확인
- [ ] 칸반 보드 1열 레이아웃
- [ ] 티켓 카드 가독성 확인
- [ ] 터치 드래그 앤 드롭 동작
- [ ] 모달이 화면에 맞게 표시
- [ ] 알림이 우측 상단에 정상 표시

### 태블릿 (640px ~ 1024px)
- [ ] 칸반 보드 2~3열 그리드
- [ ] 데스크톱 메뉴 표시
- [ ] 모달 크기 적절
- [ ] 드래그 앤 드롭 정상 작동

### 데스크톱 (≥1024px)
- [ ] 기존 UI 그대로 유지
- [ ] 4열 그리드 레이아웃
- [ ] 모든 기능 정상 작동

---

## 주요 CSS 클래스

### 반응형 표시/숨김
```css
hidden sm:flex        /* 모바일 숨김, 태블릿부터 표시 */
sm:hidden             /* 태블릿부터 숨김 */
```

### 반응형 그리드
```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

### 반응형 간격
```css
px-3 sm:px-6          /* 좌우 패딩 */
py-3 sm:py-4          /* 상하 패딩 */
space-x-2 sm:space-x-4 /* 수평 간격 */
gap-3 sm:gap-4 lg:gap-6 /* 그리드 간격 */
```

### 반응형 텍스트
```css
text-lg sm:text-2xl   /* 제목 */
text-sm sm:text-base  /* 본문 */
text-[10px] sm:text-xs /* 작은 텍스트 */
```

---

## 성능 최적화

### 이미지 최적화
- SVG 아이콘 사용 (Font Awesome)
- 이미지 로딩 시 `loading="lazy"` 속성

### CSS 최적화
- Tailwind CSS JIT 모드 (사용하는 클래스만 포함)
- 불필요한 애니메이션 최소화

### JavaScript 최적화
- 터치 이벤트 디바운싱
- 드래그 앤 드롭 성능 최적화

---

## 향후 개선 사항

### Phase 1 (완료)
- ✅ 반응형 헤더
- ✅ 반응형 칸반 보드
- ✅ 모바일 모달 최적화
- ✅ 터치 드래그 앤 드롭
- ✅ 뷰 모드 / 주차 선택 동기화

### Phase 2 (예정)
- [ ] PWA 지원 (오프라인 모드)
- [ ] 제스처 지원 (스와이프로 상태 변경)
- [ ] 햅틱 피드백
- [ ] 다크 모드
- [ ] 가로 모드 최적화

### Phase 3 (예정)
- [ ] 음성 명령 지원
- [ ] 위젯 지원 (홈 화면 위젯)
- [ ] 알림 푸시
- [ ] 생체 인증

---

## 문제 해결

### 문제: 모바일에서 드래그 앤 드롭이 작동하지 않음
**원인**: 터치 이벤트 미구현  
**해결**: `handleTouchStart/Move/End` 함수 추가

### 문제: 칸반 컬럼이 너무 좁음
**원인**: 최소 폭 미설정  
**해결**: `min-w-[280px]` 추가

### 문제: 모달이 화면 밖으로 벗어남
**원인**: 고정 폭 사용  
**해결**: `w-full max-w-*` 사용

### 문제: 텍스트가 잘림
**원인**: 고정 크기 컨테이너  
**해결**: `truncate` 또는 `line-clamp-*` 추가

---

## 참고 자료

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Mobile Web Best Practices](https://web.dev/mobile/)

---

**작성자**: 디사피엔스  
**최종 업데이트**: 2026-01-26  
**버전**: v3.4.0
