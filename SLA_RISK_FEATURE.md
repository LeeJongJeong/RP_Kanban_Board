# SLA 위험 경고 상세 정보 기능

## 📋 개요

운영 대시보드의 SLA 위험 경고 메시지를 클릭하면, 위험 상태에 있는 티켓들의 상세 정보를 확인할 수 있습니다.

## 🎯 사용 방법

### 1. 대시보드 열기
- 상단 헤더의 **"대시보드"** 버튼 클릭

### 2. SLA 위험 경고 확인
- 대시보드 하단에 빨간색 경고 박스가 표시됨
- 예: "현재 **4건**의 티켓이 SLA 초과 위험에 있습니다."

### 3. 상세 정보 보기
- 빨간색 경고 박스를 **클릭**
- SLA 위험 티켓 목록 모달이 표시됨

### 4. 티켓 상세 확인
- 모달에서 각 티켓 카드를 클릭하면 티켓 상세 정보 확인 가능

## 🔍 표시되는 정보

### 각 위험 티켓 카드에 표시되는 정보:

1. **티켓 기본 정보**
   - Severity 뱃지 (CRITICAL, HIGH)
   - DBMS 타입 (MySQL, PostgreSQL 등)
   - 상태 (In-Progress, To-Do)
   - 티켓 제목 및 ID

2. **담당자 정보**
   - 담당자 이름 (또는 "미할당")

3. **SLA 상태**
   - 경과 시간 / 목표 시간 (분 단위)
   - 남은 시간 또는 초과 시간
   - 진행률 바 (색상 코드: 빨강 = 초과, 주황 = 위험)

4. **시각적 표시**
   - 진행률 바: SLA 경과 비율을 시각적으로 표시
   - 초과 상태: 빨간색 "초과" 아이콘 및 초과 시간 표시
   - 위험 상태: 주황색 "남음" 표시 및 남은 시간

## 📊 SLA 위험 기준

티켓이 SLA 위험으로 분류되는 조건:

1. **상태**: `todo` 또는 `in_progress`
2. **심각도**: `critical` 또는 `high`
3. **SLA 설정**: `sla_minutes` 값이 존재
4. **시간 조건** (둘 중 하나):
   - 작업 시작된 경우: 목표 시간의 **80% 이상** 경과
   - 작업 시작 안된 경우: 생성 후 목표 시간의 **50% 이상** 경과

## 🎨 UI 구성

### SLA 위험 경고 박스
```
┌─────────────────────────────────────────────┐
│ ⚠️  SLA 위험 경고                     →    │
│                                             │
│ 현재 4건의 티켓이 SLA 초과 위험에          │
│ 있습니다.                                   │
│                                             │
│ 클릭하여 상세 정보 보기                     │
└─────────────────────────────────────────────┘
```
- 배경색: 빨간색 (bg-red-50)
- Hover 효과: 더 진한 빨간색 (bg-red-100)
- 커서: pointer (클릭 가능)

### SLA 위험 티켓 목록 모달
```
┌────────────────────────────────────────────────────┐
│ ⚠️  SLA 위험 티켓 목록                        ✕   │
├────────────────────────────────────────────────────┤
│                                                    │
│ ℹ️  SLA 위험 티켓은 목표 시간의 80% 이상...      │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ CRITICAL  MySQL  In-Progress          초과   │ │
│ │ #1 MySQL Replication Lag 발생               │ │
│ │ 👤 임종민  ⏱️ 경과: 1443분 / 60분          │ │
│ │ ████████████████████████ 100% 경과          │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ HIGH  PostgreSQL  In-Progress         180분  │ │
│ │ #8 PostgreSQL 슬로우 쿼리 성능 튜닝        │ │
│ │ 👤 최영준  ⏱️ 경과: 1458분 / 240분         │ │
│ │ ██████████████████ 90% 경과                 │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ 총 4건의 티켓이 SLA 위험 상태입니다.             │
│ 각 티켓을 클릭하면 상세 정보를 확인할 수 있습니다.│
└────────────────────────────────────────────────────┘
```

## 🔧 기술 구현 세부사항

### Backend API 변경

**엔드포인트**: `GET /api/dashboard/stats`

**응답 변경 (sla_at_risk 필드)**:
```json
{
  "sla_at_risk": {
    "count": 4,
    "tickets": [
      {
        "id": 1,
        "title": "MySQL Replication Lag 발생 긴급 조치",
        "status": "in_progress",
        "severity": "critical",
        "dbms_type": "MySQL",
        "sla_minutes": 60,
        "started_at": "2026-01-25 05:39:07",
        "created_at": "2026-01-25 05:54:07",
        "assigned_to_name": "임종민",
        "elapsed_minutes": 1443
      }
    ]
  }
}
```

**SQL 쿼리**:
```sql
SELECT 
  t.id,
  t.title,
  t.status,
  t.severity,
  t.dbms_type,
  t.sla_minutes,
  t.started_at,
  t.created_at,
  e.name as assigned_to_name,
  CAST((julianday('now') - julianday(COALESCE(t.started_at, t.created_at))) * 24 * 60 AS INTEGER) as elapsed_minutes
FROM tickets t
LEFT JOIN engineers e ON t.assigned_to = e.id
WHERE 
  t.status IN ('todo', 'in_progress') 
  AND t.sla_minutes IS NOT NULL
  AND t.severity IN ('critical', 'high')
  AND (
    (t.started_at IS NOT NULL AND 
     (julianday('now') - julianday(t.started_at)) * 24 * 60 > t.sla_minutes * 0.8)
    OR
    (t.started_at IS NULL AND 
     (julianday('now') - julianday(t.created_at)) * 24 * 60 > t.sla_minutes * 0.5)
  )
ORDER BY t.severity DESC, elapsed_minutes DESC
```

### Frontend 함수

**주요 함수**:
- `showSlaRiskDetails(slaData)`: SLA 위험 모달 표시
- `closeSlaRiskModal()`: 모달 닫기

**HTML 모달**: `#slaRiskModal`

## 💡 사용 시나리오

### 시나리오 1: 긴급 티켓 모니터링
1. 부서장이 아침에 대시보드 확인
2. "현재 4건의 티켓이 SLA 초과 위험에 있습니다." 경고 발견
3. 경고 박스 클릭하여 상세 정보 확인
4. MySQL Replication Lag 티켓이 이미 1443분 경과 (목표 60분)
5. 해당 티켓을 클릭하여 상세 정보 확인 후 즉시 대응

### 시나리오 2: 팀 리소스 재배분
1. 여러 티켓이 동시에 SLA 위험 상태
2. 상세 목록에서 각 티켓의 담당자 확인
3. 특정 엔지니어에게 과부하 집중 발견
4. 티켓을 다른 엔지니어에게 재할당

## ⚠️ 주의사항

1. **실시간 업데이트 아님**: 대시보드를 새로 열 때마다 데이터 갱신
2. **Critical/High만 표시**: Medium, Low severity는 표시 안 됨
3. **SLA 설정 필수**: `sla_minutes`가 없는 티켓은 표시 안 됨

## 📈 향후 개선 사항

- [ ] 실시간 자동 갱신 (WebSocket 또는 Polling)
- [ ] 이메일/Slack 알림 연동
- [ ] SLA 위험 레벨 세분화 (경고/위험/초과)
- [ ] 필터링 기능 (DBMS별, 담당자별)
- [ ] 엑셀 내보내기 기능

---
**작성일**: 2026-01-26  
**버전**: v3.3.0
