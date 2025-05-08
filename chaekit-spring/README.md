## docker-compose 실행

1. 아래 명령어로 포트 사용 중인지 확인
   ```bash
   lsof -i :3306
   lsof -i :8080
   ```
2. 루트 디렉토리에 .env 파일을 생성
3. Docker 컨테이너 실행
   ```bash
   # 백그라운드 실행
   docker compose up -d --build
   # 정상 작동 확인
   docker compose ps
   # 정지
   docker compose down
   # 기존 db와 충돌되는 경우
   docker-compose down -v
   ```

## 🐬 MySQL 설정

1. MySQL 설치

   - macOS: `brew install mysql`
   - Ubuntu: `sudo apt install mysql-server`
   - Windows: [MySQL 다운로드](https://dev.mysql.com/downloads/mysql/)

2. MySQL 실행 및 접속
   ```bash
   mysql -u root -p
   ```
3. 데이터베이스 생성
   ```sql
   CREATE DATABASE chaekit;
   SHOW DATABASES;
   ```

## 🐳 Redis 설정

1. Redis 설치
   - macOS: `brew install redis`
   - Ubuntu: `sudo apt install redis-server`
   - Windows: [Redis 다운로드](https://redis.io/download)
2. Redis 실행
   - macOS: `brew services start redis`
   - Ubuntu: `sudo service redis-server start`
   - Windows: `C:\Program Files\Redis\redis-server.exe` 실행

## 🔐 개발용 .env 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 채워주세요:

### MySQL

```env
# DB
DB_URL=jdbc:mysql://localhost:3306/chaekit
DB_USERNAME=root
DB_PASSWORD={Db 비밀번호}
DB_DRIVER_CLASS=com.mysql.cj.jdbc.Driver
JPA_DIALECT=org.hibernate.dialect.MySQL8Dialect

# Redis
REDIS_URL=localhost

# JWT
JWT_SECRET={your_secret_key}
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=1209600000

# Admin
ADMIN_NAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=0000

# GMAIL
GMAIL_ADDRESS={gmail 주소}
GMAIL_PASSWORD={gmail 비밀번호}

# Spring
SPRING_PROFILES_ACTIVE=local

# AWS
EBOOK_BUCKET_NAME=chaekit
IMAGE_BUCKET_NAME=chaekit-image
AWS_S3_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID={S3 버킷 access key}
SECRET_ACCESS_KEY={S3 버킷 secret key}
EBOOK_MAX_FILE_SIZE=20971520
PRESIGNED_URL_EXPIRATION_TIME=3600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://chaekit.com,https://*.chaekit.com

# Local Server Port
LOCAL_SERVER_PORT=8080

```

### H2

```env
# DB
DB_URL=jdbc:h2:mem:testdb
DB_USERNAME=sa
DB_PASSWORD=password

DB_DRIVER_CLASS=org.h2.Driver
JPA_DIALECT=org.hibernate.dialect.H2Dialect
~~~~
(이하 동일)
```

## Github Actions 테스트 22
