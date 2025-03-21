## 🐬 MySQL 세팅

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
   
## 🔐 .env 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 채워주세요:

```env
DB_URL=jdbc:mysql://localhost:3306/chaekit
DB_USERNAME=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRATION_MS=3600000

SPRING_PROFILES_ACTIVE=dev