## 리뷰특가 앱 미리보기

- 앱 기준: Flutter `ReviewSpecialMenuDetailPage`, `ReviewSpecialSalesTimeDisplay`, `MeemongDateTab`의 고객 화면 구성.
- 사진은 기존 `GET /api/v1/admins/users/:userId`의 `userPhotos`에서 `portfolio`/`shop` 유형을 조회합니다. 메뉴 사진과 예약 시간은 관리자 메뉴 상세 응답을 사용합니다.
- 날짜·시간 선택은 화면 미리보기이며 예약/찜 API를 호출하지 않습니다. 등록 시간 기준으로 표시하며, 고객 앱의 실시간 예약 차단 상태는 포함하지 않습니다.
- 지도는 네이버 Maps JavaScript API를 사용합니다. `.env.local`과 배포 빌드 환경에 `NEXT_PUBLIC_NAVER_MAP_KEY_ID`를 설정하고, 해당 Maps 애플리케이션의 Web 서비스 URL에 어드민 도메인(로컬 개발 시 로컬 주소)을 등록해야 합니다. 공개 웹 키 ID만 사용하며 Secret은 넣지 않습니다. 설정 변경 후 재빌드가 필요합니다.
- 지도 사양: 메뉴의 매장 좌표, 확대 수준 17, 16:9 비율, 모서리 12px, 위치 마커. 키 미설정/인증 실패는 지도 영역에 명시합니다.
- 공식 설정 안내: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html

### 표시값과 API 계약

- 분석 필터는 서버 저장값을 그대로 전송합니다. `두피케어`와 `헤드스파`를 합치지 않습니다.
- 앱 표시 별칭 근거: Flutter `lib/constants/strings.dart`의 `treatmentDisplayNameOverrides` → `ReviewSpecialMenu.treatmentTypeWithCutOptionLabel` → 상세 `_ReviewSpecialDetailSummary`. `커트 → 컷트`, `두피케어 → 헤드스파`를 미리보기에 적용하고, 분석 목록/필터/운영 정보에는 원본과 앱 표시명이 다른 경우 둘 다 표시합니다.
- 서버 `resources/meemong/const.js`의 요일 계약은 `월/화/수/목/금/토/일`입니다. 예약 DTO도 해당 값만 허용합니다. 운영 실응답 확인은 아직 하지 않았습니다.
- 관리자 메뉴 응답의 `designer.portfolioImages`, `storeImages`는 현재 서버 `services/v1/admins/timeSaleMenus/index.js`에서 항상 빈 배열입니다. 따라서 관리자 회원 상세의 `userPhotos` 조회가 필요합니다.
- 분석 지표 3개는 구버전 서버에서 누락될 수 있어 선택적 숫자로 모델링하고 `-`로 표시합니다. 0건과 누락을 구분합니다.

### 미리보기 폰트

기존 Meemong 웹 프로젝트의 `PretendardVariable.woff2`를 재사용합니다. 원본 3종 OTF 약 4.7MB 대신 전체 글리프를 가진 단일 WOFF2 약 2.1MB로 교체해 임의의 한글 메뉴명도 보존합니다. 모달은 동적 로딩하고 폰트 preload는 끕니다.
