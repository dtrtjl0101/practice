# qwerty-sc25

A mono repo for qwerty

# 팀원

| 이름   | 이메일                 | 학번      | 역할         |
| ------ | ---------------------- | --------- | ------------ |
| 고종환 | jonghwankoh@ajou.ac.kr | 201920710 | Backend      |
| 김인성 | ptis307@ajou.ac.kr     | 202222392 | Frontend     |
| 박원민 | satcom1600@ajou.ac.kr  | 201820766 | PM, Frontend |
| 이재빈 | dtrtjl0101@ajou.ac.kr  | 202128678 | Backend      |

---
Chaekit - 인터랙티브 이북 플랫폼

> 사용자들이 함께 책을 읽고, 하이라이트를 공유하며, 토론할 수 있는 소셜 리딩 서비스입니다.

주요 기능

- ebook 리더: 사용자는 구매하거나 제공된 책을 웹에서 바로 읽을 수 있습니다.
- 하이라이트 및 메모: 책의 중요한 부분에 하이라이트를 하고, 생각을 메모로 남길 수 있습니다.
- 소셜 기능:
  - 그룹 기능: 독서 모임을 만들고 관리하며, 그룹원들과 함께 책을 읽고 토론할 수 있습니다.
  - 댓글 및 반응: 다른 사람의 하이라이트에 댓글을 달고 이모지 반응을 남길 수 있습니다.
- 도서 검색 및 요청: 원하는 책을 검색하고, 없는 책은 등록을 요청할 수 있습니다.
- 크레딧 시스템: 서비스 내 활동에 사용할 수 있는 크레딧을 구매하고 관리합니다.
- 대시보드: 독서 활동 통계 및 그룹 활동 내역을 시각적으로 확인할 수 있습니다.

# 사용 기술 스택

- **백엔드**:

  - Java 17, Spring Boot 3
  - Gradle
  - MySQL, Redis
  - JPA, Querydsl
  - Flyway (DB 마이그레이션)
  - JaCoCo (테스트 커버리지)
  - Docker, docker-compose, Nginx

- **프론트엔드**:

  - React 19, TypeScript
  - Bun (패키지 매니저)
  - Vite (번들러)
  - MUI (Material UI)
  - TanStack Query, Jotai 등 상태 관리

- **인프라/배포**:
  - AWS CDK (TypeScript)
  - AWS S3, CloudFront, Certificate Manager 등
  - AWS ECR, ECS, RDS, ec2

---

# 프로젝트 구조

```
qwerty-sc25/
├── chaekit-spring/   # 백엔드(Spring Boot, MySQL, Redis, Docker 등)
│   ├── src/          # Java 소스 및 리소스
│   ├── build.gradle  # Gradle 빌드 설정
│   ├── docker-compose.yml  # 개발용 도커 컴포즈
│   └── ...
├── client/           # 프론트엔드(React, Bun, Vite)
│   ├── src/          # React 소스 코드
│   ├── public/       # 정적 파일
│   ├── package.json  # 프론트엔드 패키지 설정
│   ├── Dockerfile    # 프론트엔드 도커파일
│   └── cdk/          # AWS CDK IaC 코드(TypeScript)
│       ├── lib/      # CDK 스택 정의
│       └── ...
└── README.md         # 프로젝트 소개 및 구성 설명
```

---

# 사용 설명서
  ## E-Book 크레딧 스토어
   - 도서 페이지 접속 및 도서 탐색
     - 검색 기능을 통한 원하는 도서 찾기
     - 메인 화면에서 장르별/추천 도서 확인
   - 크레딧 충전 및 도서 구매
     - 첫 결제 프로모션 혜택 확인
     - 크레딧으로 도서 구매
   - 구매 도서 확인
     - 마이페이지에서 보유 도서 확인
     - 독서 진행률 및 히스토리 관리
   - 출판사 대시보드
     - 전자책 판매량 등 매출 분석
  ## 온라인 독서모임 커뮤니티
   - 독서 모임 탐색 및 참가
     - 모임정보/태그별 모임 필터링
     - 모임 후기를 통한 분위기 파악
     - 전자책 구매 후 활동 참가
   - 모임 활동 참여
     - 실시간 단체 대화방 참여
     - 독서 진행률 공유 및 시각화 확인
     - 활동 점수 랭킹 시스템 활용
  ## 메모 공유 시스템
   - 리더기에서 메모 작성
     - 독서 중 원하는 구간에 메모 작성
     - 메모 공개 범위 선택
   - 메모 상호작용
     - 다른 사용자 메모에 댓글 및 감정표현
     - 메모 관련 알림 수신 및 확인
     - 인요오딘 토론 링크 접근
  ## 독서 토론 시스템
   - 토론 참여
     - 토론 게시판에서 활동에 대한 토론 작성
     - 찬반 토론 형태로 의견 표현
   - 메모 연동 토론
     - 리더기의 메모를 토론 글에 참조
     - 구체적인 텍스트 인용으로 토론 근거 제시

# dev 서버 Test Coverage

[JaCoCo Report](https://qwerty-sc25.github.io/qwerty-sc25/dev-server-test-coverage/)
