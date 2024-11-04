# Porting manual

## 0. 준비물

- Docker
- Docker Compose
- EC2 (or Linux server)

## 1. git clone

EC2에서 진행한다.  

```
git clone https://lab.ssafy.com/s11-final/S11P31D206.git
```

## 2. HTTPS 인증서

certbot으로 let's encrypt 인증서를 발급받습니다. 

`exec/cert`에서 cert-compose.yml을 실행  

```
docker-compose -f ./cert-compose.yml up
```

`exec/cert/data/certbot/conf`에 인증서가 생성되었다면 성공한 것. 

인증서 생성 후 컨테이너를 내립니다.

```
docker-compose -f ./cert-compose.yml down
```



우리 프로젝트는 프론트엔드의 Docker container 안에 Nginx가 설정되어 있음.

- EC2 내부의 인증서 경로가 React Docker 컨테이너 내부 경로에 마운트 되도록 설정해야 Nginx에서 인증서를 찾을 수 있음
  - frontend/Dockerfile, frontend/default.conf(nginxconf파일), cert/Jenkinsfile(Jenkins pipeline 파일)에서 이에 맞게 설정되어 있어 build시 알맞게 경로를 잡습니다. 



## 3. DB 설치

```

```







## 4. Jenkins - CI/CD

```

```

실행 후 Jenkins 설정.  

- Item 생성?
- Plugins 설치
- Credentials 추가?

---

# 버전

### Backend
- OpenJDK : 
- Spring Boot : 
- Spring Data JPA : 
- JUnit : 
- Nginx : 
- MySQL : 
- Node.js : 
- FastAPI : 

### CI/CD
- Jenkins : jenkins/jenkins:2.482-jdk17
- docker : 24.0.7
- docker compose : 2.30.1

### Front
- React

### AI
- 

<br>

---
# 외부 서비스
<br>

- 카카오 Oauth
- Naver Clova API

<br>

---
# 환경변수

```

```

---