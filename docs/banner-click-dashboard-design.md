# 배너 클릭 대시보드 설계 및 구현 문서

최종 갱신: 2026-07-27

## 1. 목적과 지표 정의

배너 관리 화면에서 관리자에게 다음 정보를 제공한다.

- 기간별 전체 클릭수와 일평균 클릭수
- 앱 내 위치별 클릭수와 전체 클릭 중 비중
- 배너 ID별 클릭수와 일별 추이
- 같은 위치에 게시한 서로 다른 배너 ID 간 비교

이번 범위에서는 노출수를 수집하지 않는다. 따라서 화면에서 제공하는 값은 CTR(클릭률)이 아니라 **클릭수, 일평균 클릭수, 클릭 비중, 이전 기간 대비 클릭수 증감률**이다. 광고주에게 CTR로 안내하면 안 된다.

배너를 교체할 때 기존 배너를 수정하지 않고 새 배너를 생성한다는 운영 원칙을 전제로 한다. 이 원칙을 지키면 이번 주 배너와 다음 주 배너를 서로 다른 `bannerId`로 구분해 비교할 수 있다. 같은 ID의 이미지나 링크를 재사용하면 재사용 전후 캠페인을 소급해 분리할 수 없다.

## 2. 확정한 아키텍처

### 2.1 원본 이벤트가 유일한 기준이다

Flutter 앱은 클릭할 때마다 `bannerClicks`에 원본 문서 하나만 추가한다. 관리자 화면은 선택 기간의 원본을 읽어 브라우저에서 일별·위치별·배너별로 집계한다.

현재 사용하지 않는 데이터:

- `bannerAnalytics`
- `bannerSummary`
- 각 문서 아래의 `userStats`, `timeslots`

기존 앱은 위 집계를 클라이언트에서 원본 저장과 별도로 갱신했다. 이 구조는 다음 이유로 신뢰할 수 없다.

- 원본 저장은 성공하고 집계 갱신은 실패할 수 있다.
- 여러 앱이 동시에 read-modify-write하면 증가분이 유실될 수 있다.
- 위치 식별자가 없어 같은 배너 유형의 실제 화면 위치를 구분할 수 없다.
- 주·월·전체 문서를 앱마다 갱신해 쓰기 비용과 오류 범위가 커진다.

V2 앱부터 클라이언트 사전 집계를 완전히 중단한다. 기존 집계 컬렉션은 과거 호환을 위해 당장 삭제하지 않지만 대시보드 숫자에는 사용하지 않는다.

### 2.2 관리자 Firestore 연결

`firebase-admin`, 서비스 계정, Next.js API Route, Cloud Functions를 사용하지 않는다. `meemong-chat-admin`과 동일하게 Firebase Web SDK로 named Firestore DB를 직접 읽는다.

DB 선택 기준은 `NODE_ENV`가 아니라 `NEXT_PUBLIC_API_URL`이다.

| `NEXT_PUBLIC_API_URL`                     | Firestore database ID | 화면 배지 |
| ----------------------------------------- | --------------------- | --------- |
| origin이 정확히 `https://api.meemong.com` | `meemong-chat`        | 운영      |
| 테스트 API, localhost 및 그 밖의 URL      | `meemong-dev`         | 개발      |
| 미설정 또는 URL 형식 오류                 | 초기화 실패           | 설정 오류 |

운영 주소만 화이트리스트한다. 잘못 설정한 주소가 운영 클릭 데이터를 읽는 것보다 개발 DB로 연결되거나 명시적으로 실패하는 쪽이 안전하다. `.env.example`에 이 규칙을 기록했고 대시보드 상단에도 DB 이름을 표시한다.

Firebase Web config는 공개 식별자이며 비밀키가 아니다. 서비스 계정 자격증명은 저장소에 추가하지 않는다.

### 2.3 Rules 결정

운영·개발 DB의 현행 Rules가 비로그인 Web SDK 읽기를 허용한다는 점을 확인하고 이 구조를 승인했다. 따라서 현재 대시보드 구현을 위해 Rules를 변경하거나 배포하지 않는다.

주의할 점:

- 기존 V1 원본에는 `userId`, `imageUrl`, `redirectUrl`이 들어 있다.
- 관리자 화면은 이 값을 사용하지 않지만 직접 조회 구조상 네트워크로 원본 문서가 전달된다.
- V2부터 해당 필드를 저장하지 않아 새 데이터의 노출 범위를 줄인다.
- 향후 광고주에게 제공할 때는 현행 Rules와 Firebase config를 공유하지 않고 인증된 별도 API 또는 집계 저장소를 사용해야 한다.

광고주 데이터 제공 릴리즈의 선행 조건(P0):

1. 기존 V1 `bannerClicks`에서 `userId`, `imageUrl`, `redirectUrl`을 제거하거나 원본을 접근 제한 저장소로 이전한다.
2. 비로그인 원본 읽기를 종료하고 인증된 집계 API 또는 제한된 집계 컬렉션만 공개한다.
3. 마이그레이션 전후 문서 수와 클릭 합계가 동일한지 검증한다.

이는 현재 관리자 MVP 배포를 막지는 않지만, 완료 전에는 광고주 계정이나 외부 클라이언트에 데이터를 제공하지 않는다. 실제 데이터 변경은 복구 계획과 별도 승인을 받은 마이그레이션 작업으로 수행한다.

## 3. 클릭 이벤트 스키마

### 3.1 Flutter V2

컬렉션: `bannerClicks`

```text
schemaVersion: 2
bannerId: string
placementId: string
userType: "모델" | "디자이너" | "unknown"
bannerType: string
clickedAt: Firestore server timestamp
clientClickedAt: UTC timestamp
platform: "flutter"
appVersion: string
buildMode: "release" | "profile" | "debug"
```

필드 원칙:

- 집계 시간의 기준은 조작 가능성이 낮은 `clickedAt` 서버 시간이다.
- `clientClickedAt`은 전송 지연 등 진단용이며 집계 기준으로 사용하지 않는다.
- `bannerId`와 `placementId`를 반드시 저장한다.
- `userId`, 설치 ID/deviceId, 이미지 URL, 이동 URL, `displayType`은 저장하지 않는다.
- 사용자나 설치 단위 중복 제거를 하지 않는다. 한 번 탭할 때 원본 클릭 1건으로 센다.
- 앱 버전 조회가 실패해도 클릭 저장은 계속하며 `appVersion`만 `unknown`으로 남긴다.

### 3.2 위치 ID

Flutter와 관리자는 아래 값을 동일하게 사용한다.

| `placementId`              | 의미                                |
| -------------------------- | ----------------------------------- |
| `model_home_carousel`      | 모델 홈 일반 캐러셀                 |
| `designer_home_carousel`   | 디자이너 홈 일반 캐러셀             |
| `thunder_matching_top`     | 번개매칭 상단                       |
| `chat_list_top`            | 채팅 목록 상단                      |
| `model_map_top`            | 모델 지도 상단                      |
| `app_start_bottom_sheet`   | 앱 시작 배너 바텀시트               |
| `designer_general_unknown` | V1 디자이너 일반 배너의 위치 미확인 |
| `unknown`                  | 알 수 없거나 유효하지 않은 위치     |

`designer_general_unknown`과 `unknown`은 관리자 정규화 결과다. 새 Flutter 앱은 실제 화면 위치 상수만 기록한다.

### 3.3 V1 호환 정규화

과거 문서는 `schemaVersion`과 `placementId`가 없다. 대시보드는 `userType`과 `bannerType`을 다음처럼 제한적으로 변환한다.

| V1 조건               | 정규화 위치                |
| --------------------- | -------------------------- |
| `bannerType=바텀시트` | `app_start_bottom_sheet`   |
| `bannerType=번개매칭` | `thunder_matching_top`     |
| `bannerType=채팅배너` | `chat_list_top`            |
| 모델 + `지도로보기`   | `model_map_top`            |
| 모델 + `일반`         | `model_home_carousel`      |
| 디자이너 + `일반`     | `designer_general_unknown` |
| 나머지                | `unknown`                  |

과거 디자이너 일반 배너는 홈과 과거 미디어 화면을 문서만으로 구분할 수 없다. Git 커밋 시점이나 추정 스토어 배포일로 클릭을 억지로 나누지 않는다. 구버전 앱의 잔존 기간도 알 수 없기 때문이다.

V1 바텀시트는 비로그인 사용자를 모델로 저장할 수 있었으므로 사용자 유형을 `unknown`으로 정규화한다.

바텀시트 탭에서는 사용자 유형 필터를 적용하지 않는다. 모델·디자이너 탭 모두 전체 바텀시트 데이터를 동일하게 표시하며 화면에 이 제한을 경고한다. V1을 임의의 사용자 유형으로 귀속시키지 않기 위한 선택이다.

V2 문서에서 `placementId`가 없거나 허용 목록 밖이면 화면 라벨로 추론하지 않고 `unknown`으로 처리한다. 이는 새 앱의 계측 오류를 숨기지 않기 위한 정책이다.

디자이너 `구인구직` 배너는 Flutter가 아니라 구인구직 웹에서 열리며 현재 웹 클릭 핸들러는 URL만 연다. 이번 관리자+Flutter 범위에서는 해당 클릭을 새로 수집하지 않는다. 따라서 이 유형의 0건을 실제 무클릭으로 해석하면 안 되며, 분석 대상에 포함하려면 job-web에 같은 V2 이벤트 계약을 별도로 적용해야 한다.

## 4. 관리자 대시보드

### 4.1 진입과 필터

- 배너 관리 탭의 `전체`, `모델`, `디자이너` 오른쪽에 `대시보드 보기` 버튼을 둔다.
- 경로는 `/banner/dashboard`이며 같은 자리에 `목록 보기` 버튼을 제공한다.
- 목록과 대시보드를 오갈 때 `userType`, `bannerType` 쿼리를 유지한다.
- 기간은 최근 7일, 최근 30일, 직접 설정, 전체를 제공한다.
- 디자이너 홈 위치가 비어 있으면 V2 앱 클릭부터 구분 가능하고, 과거 디자이너 일반 클릭은 위치 미확인으로 집계된다는 안내를 표시한다.
- 최근 7일·30일에는 진행 중인 오늘을 포함하고 화면에 이를 명시한다.
- 직접 설정 기간이 비어 있거나 역전되면 이전 캐시 숫자를 숨기고 오류만 표시한다.
- 위치 필터를 제공한다.
- `활성화된 배너만 보기`를 제공하며, 목록과 같은 현재 상태 판정으로 요약·차트·위치·표·비교 전체를 필터링한다.
- 모든 일 경계는 KST 자정이다. 예: 2026-07-01 KST 시작은 `2026-06-30T15:00:00Z`다.

### 4.2 화면 구성

1. 현재 연결 DB 환경 배지
2. 총 클릭수
3. 클릭된 배너 수
4. 선택 기간 일평균 클릭수
5. 이전 동일 기간 대비 클릭수 증감률
6. 일별 클릭 추이
7. 위치별 클릭수와 선택 결과 내 비중
8. 배너 ID, 이미지, 대상, 유형, 위치, 현재 상태, 클릭수, 일평균 표
9. 두 배너의 총 클릭수와 일별 추이 비교

일별 추이 그래프에서 날짜에 마우스를 올리면 해당 날짜의 전체 클릭수와 현재 필터에 포함된 배너별 클릭수를 표시한다. 배너 비교 그래프에서는 전체 클릭수와 선택한 두 배너의 클릭수를 함께 표시한다.

배너 표는 클라이언트 페이지네이션을 적용한다. 위치 필터를 선택하면 해당 위치의 실제 클릭이 있는 배너만 표시하고, 클릭이 없는 배너의 현재 설정 위치를 분석 위치로 추정하지 않는다. 위치 필터가 없을 때 클릭이 없는 행은 `현재 설정`임을 라벨에 표시한다.

고정·직접 설정 기간의 일평균은 선택 기간 전체를 분모로 사용한다. 전체 기간에서 요약 값은 현재 필터 결과의 최초 클릭일부터 조회 종료일까지, 배너별 값은 해당 배너의 최초~최종 클릭일을 분모로 사용한다.

이전 기간 데이터가 실패하거나 상한을 초과하면 현재 기간 숫자는 계속 표시하되 비교값만 표시하지 않는다. 전체 기간은 이전 기간 비교를 제공하지 않는다.

삭제된 배너 또는 현재 API 결과와 결합되지 않는 과거 클릭도 버리지 않고 `삭제·미매칭` 행으로 표시한다.

### 4.3 현재 상태와 과거 효율의 구분

배너 API의 운영·테스트 응답과 백엔드 스키마를 확인한 결과 `startAt`, `isActive`가 내려오지 않는다. 관리자 TypeScript 모델에 선택 필드가 남아 있지만 실제 응답 근거로 사용할 수 없다.

목록과 대시보드는 동일한 `getBannerStatusesById()`를 사용한다.
상태 라벨도 공용 `BannerStatusBadge`를 사용해 문구와 색상을 동일하게 표시한다.

- `endAt`이 지났거나 `deletedAt`이 있으면 종료/비활성 처리한다.
- `일반` 배너는 캐러셀이므로 사용 가능한 여러 배너를 모두 활성화로 표시한다.
- 비캐러셀 위치는 앱이 최신순 첫 배너를 표시하므로 같은 대상·유형 중 최신 사용 가능 배너만 활성화로 표시한다.
- Flutter의 단일 배너 요청도 `createdAtDesc`를 명시해 관리자 상태 판단과 맞춘다.

이 상태는 **현재 상태**일 뿐 과거 게시 기간을 복원한 값이 아니다. `startAt`/`isActive` 이력이 없으므로 클릭 분석에는 선택 기간의 실제 원본 클릭만 사용한다.

## 5. 조회와 성능

### 5.1 현재 방식

Firestore 쿼리는 `clickedAt >= 시작`, `clickedAt < 종료`, `orderBy(clickedAt)` 조건을 사용한다. 단일 필드 범위/정렬이므로 별도 복합 인덱스가 필요하지 않다.

운영 데이터 측정 결과(2026-07-27 14:06 KST, 오늘은 진행 중):

| 범위      | 문서 수 |
| --------- | ------: |
| 최근 7일  |     310 |
| 최근 30일 |   1,379 |
| 전체      |  29,360 |

저장된 원본의 품질 검사 결과는 다음과 같다.

- 전체 문서에 `clickedAt`, `bannerId`, `userType`, `bannerType`이 존재한다.
- 전체 문서의 `platform`은 `flutter`이며 최근 30일에 클릭 0건인 날짜는 없다.
- 최근 29개 완료일 평균은 46.8클릭, `userId`가 있는 일평균 클릭 사용자는 44.0명이다.
- 전체 29,360건은 V1이며, V2 위치 데이터는 수정 앱을 배포한 뒤부터 생성된다.

이 검사는 Firestore에 도달한 문서의 완전성만 확인한다. V1 앱은 클릭 저장 Future를 기다리지 않고 링크를 열며 저장 실패를 중앙 수집하지 않으므로, 앱 종료·네트워크·Rules 오류로 문서 자체가 만들어지지 않은 클릭의 손실률은 원본만으로 증명할 수 없다. 다만 원본 문서를 먼저 저장한 뒤 기존 사전 집계를 갱신하므로 `bannerAnalytics`나 `bannerSummary` 갱신 실패는 이 대시보드 클릭수에 영향을 주지 않는다.

개발 DB는 같은 시점에 0건이었다. 현재 전체 조회를 지원하기 위해 `MAX_CLICK_DOCS=50,000`으로 설정했다. 이 프로젝트의 named Firestore DB에 실제 실행한 쿼리는 `limit` 10,000 초과 시 `invalid-argument: maximum value of 10000`을 반환했다. 따라서 문서 커서로 최대 10,000건씩 나누어 조회한다.

원본을 내려받기 전에 `getCountFromServer()`로 기간 문서 수를 확인하고 50,000건을 초과하면 즉시 중단한다. 카운트 이후 동시 클릭으로 경계를 넘는 경우를 잡기 위해 실제 조회는 최대 50,001번째 문서까지만 확인하며, 초과 시 숫자를 표시하지 않고 기간 축소를 안내한다.

이전 기간 비교가 필터 없는 전체 조회이면 `getCountFromServer()` 결과만 사용한다. 사용자 유형·배너 유형·위치 필터가 있으면 V1 정규화가 필요하므로 이전 기간 원본을 읽는다.

따라서 이전 기간이 50,000건을 넘는 경우 필터 없는 비교는 count로 정확한 증감률을 표시하지만, 필터가 있는 비교는 잘린 원본으로 잘못된 값을 만들지 않도록 `-`로 표시하고 기간 축소를 안내한다.

### 5.2 일·주·월 합산 시점

현재는 별도 `bannerClickDailyMetrics`를 만들지 않는다. 관리자가 대시보드를 열거나 필터를 변경할 때 브라우저가 선택 기간 원본을 KST 일자로 접어 일·주·월·전체 값을 계산한다. Firestore가 자동으로 집계하는 기능은 아니다.

원본이 50,000건 상한에 자주 도달하거나 광고주용 API가 필요해지면 다음 단계로 서버 집계를 도입한다.

```text
bannerClickDailyMetrics/{yyyy-MM-dd}_{bannerId}_{placementId}
  date: yyyy-MM-dd (KST)
  bannerId: string
  placementId: string
  clicks: number
  updatedAt: server timestamp
```

이 문서는 Firestore 자체가 만들지 않는다. Cloud Functions의 `bannerClicks` create trigger 또는 신뢰 가능한 서버/정기 작업이 원자적으로 생성·증가시켜야 한다. 주·월·전체는 일별 집계를 조회 시 합산하며 중복된 주·월 문서를 따로 쓰지 않는 편이 재집계와 정합성 관리에 유리하다.

현재 직접 조회 MVP에는 이 사전 집계를 추가하지 않는다.

## 6. 구현 파일

### 관리자

- `.env.example`: API URL과 DB 선택 규칙
- `src/lib/firebase/database.ts`: named DB 결정 순수 함수
- `src/lib/firebase/client.ts`: Firebase Web SDK 초기화
- `src/apis/firestore/bannerClicks.ts`: 기간 조회와 상한 처리
- `src/queries/bannerClicks/index.ts`: React Query 연결
- `src/constants/bannerClick.ts`: 위치, 기간, 조회 상한
- `src/models/bannerClick.ts`: 정규화/집계 타입
- `src/utils/bannerClickDate.ts`: KST 범위와 일자 목록
- `src/utils/bannerClickAnalytics.ts`: V1/V2 정규화, 필터, 집계
- `src/components/features/banner/banner-click-dashboard/`: 대시보드 화면
- `src/components/features/banner/banner-click-trend-chart/`: 일별 SVG 추이 차트
- `src/app/(dashboards)/banner/dashboard/page.tsx`: 대시보드 경로
- `src/components/features/banner/banner-tab/index.tsx`: 목록/대시보드 전환

기존 배너 목록에는 활성 배너만 보기 필터와 배너 ID 열이 포함되어 있다. 일반 배너 다중 활성화 판정도 `src/utils/banner.ts`에 반영되어 있다.

### Flutter

- `lib/constants/banner_placement.dart`: 공용 위치 ID
- `lib/provider/firestore_banner_click_provider.dart`: V2 원본 이벤트 1회 저장
- `lib/presentation/widgets/banner_widget.dart`: 단일 배너 위치 전달과 최신순 조회
- `lib/presentation/widgets/banner_carousel_widget.dart`: 캐러셀 위치 전달
- `lib/presentation/widgets/ad_banner_bottom_sheet.dart`: 바텀시트 위치와 게스트 유형 처리
- 각 배너 호출 화면: 실제 `placementId` 연결
- `lib/presentation/pages/designer/media/media_page.dart`: 현재 라우팅되지 않는 과거 배너 호출 제거

## 7. 검증 결과

관리자:

- DB 선택, 배너 활성 상태, KST 경계, 잘못된 직접 설정 기간, 이전 기간, V1/V2 정규화, 필터, 일별/배너별 fold 단위 테스트 통과
- TypeScript 검사 통과
- 변경 파일 ESLint 오류/경고 없음
- Next.js 프로덕션 빌드 성공
- 운영 최신 V1 문서의 `clickedAt`이 Firestore Timestamp이고 예상 V1 필드가 존재함을 확인

Flutter:

- 변경 파일 포맷 완료
- 변경 범위 analyzer에서 컴파일 오류 없음
- V2 허용 필드만 생성하고 사용자·URL·deviceId가 빠졌는지 검증하는 단위 테스트 통과
- 전체 테스트는 배너와 무관한 기존 `designer_announcement_provider_test.dart:213` 1건이 실패한다. 기대 순서 `[3, 2]`와 실제 순서 `[2, 3]`의 불일치이며 해당 파일만 다시 실행해도 동일하다.
- 전체 분석에 기존 파일의 선행 lint warning/info가 남아 있으며 이번 배너 계측 변경에서 새 오류는 발생하지 않음

## 8. 배포 및 운영 순서

1. 관리자 배포 환경의 `NEXT_PUBLIC_API_URL`을 확인한다.
2. 관리자 대시보드를 먼저 배포한다. V1 클릭도 즉시 표시된다.
3. Flutter V2를 개발 DB에서 클릭해 문서 필드와 `placementId`를 확인한다.
4. Flutter 앱을 배포한다. 이후 클릭부터 정확한 위치 분류가 가능하다.
5. 운영에서 총 클릭수와 위치별 합계가 일치하는지 확인한다.
6. 50,000건 상한 접근 빈도를 모니터링한다.
7. 광고주 제공 전 인증, 제공 범위, 보존 기간을 확정하고 서버 일별 집계/API를 별도 설계한다.

관리자 대시보드 배포는 Flutter 출시를 기다릴 필요가 없다. 다만 과거 V1 디자이너 일반 클릭은 계속 `위치 미확인`으로 표시되며, 정확한 홈 위치 데이터는 V2 출시 이후부터 쌓인다.
