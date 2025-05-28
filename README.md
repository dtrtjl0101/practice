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

# 사용 기술 스택

- **백엔드**:

  - Java 17, Spring Boot 3
  - Gradle
  - MySQL, Redis
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

- `chaekit-spring/`: Spring Boot 기반의 백엔드 서버, DB 마이그레이션, 도커 환경, Nginx 설정 등 포함
- `client/`: React 기반의 프론트엔드, Bun 패키지 매니저 사용, Vite 빌드 도구, AWS CDK를 통한 인프라 코드 포함
- `client/cdk/`: AWS 리소스(Certification, S3 배포 등) IaC 코드

---

# dev 서버 Test Coverage

[JaCoCo Report](https://qwerty-sc25.github.io/qwerty-sc25/dev-server-test-coverage/)
