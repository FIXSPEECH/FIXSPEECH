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

certbot으로 let's encrypt 인증서를 발급받는 nginx 파일이 있습니다.  

`exec/cert`에서 cert-compose.yml을 실행  

```
docker-compose -f ./cert-compose.yml up
```

`exec/cert/data/certbot/conf`에 인증서가 생성되었다면 성공한 것. 

인증서 생성 후 컨테이너를 내립니다.

```
docker-compose -f ./cert-compose.yml down
```

우리 프로젝트는 프론트엔드의 Docker container 안에 nginx가 설정되어 있음.

- EC2 내부의 인증서 경로가 React Docker 컨테이너 내부 경로에 마운트 되도록 설정해야 nginx에서 인증서를 찾을 수 있음
  - frontend/Dockerfile, frontend/default.conf(nginxconf파일), cert/Jenkinsfile(Jenkins pipeline 파일)에서 이에 맞게 설정되어 있어 build시 알맞게 경로를 잡습니다. 
  

## 3. FE 

nginx + React 구조

default.conf (nginx conf 파일)

```
# 백엔드 서버 그룹 정의
upstream backend {
    server k11d206.p.ssafy.io:8081;  # 스프링 부트 백엔드
}

# FastAPI 서버 그룹 정의
upstream fastapi {
    server k11d206.p.ssafy.io:8000;  # FastAPI 서버
}

# HTTP to HTTPS redirection
server {
    listen 80;                        # HTTP 포트 80 리스닝
    listen [::]:80;                   # IPv6 지원
    server_name k11d206.p.ssafy.io;   # 서버 도메인 이름

    # 모든 HTTP 요청을 HTTPS로 리디렉션 (301 영구 리다이렉트)
    return 301 https://$host$request_uri;
    
    # 검색엔진 크롤러 차단 설정
    location /robots.txt {
        return 200 "User-agent: *\nDisallow: /"; # 모든 봇의 접근을 차단
    }
}

# HTTPS 설정을 위한 메인 서버 블록
server {
    listen 443 ssl;                   # HTTPS 포트 443 리스닝 (SSL/TLS 활성화)
    server_name k11d206.p.ssafy.io;   # 서버 도메인 이름

    # SSL 인증서 설정 (Let's Encrypt 사용)
    ssl_certificate /etc/nginx/ssl/fullchain.pem;      # SSL 인증서 경로
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;    # SSL 개인키 경로

    # SSL 보안 설정 강화
    ssl_protocols TLSv1.2 TLSv1.3;                    # TLS 버전 지정
    ssl_prefer_server_ciphers on;                     # 서버 암호화 방식 우선
    ssl_ciphers HIGH:!aNULL:!MD5;                     # 강력한 암호화 알고리즘 사용

    # 웹 서버 기본 설정
    root /usr/share/nginx/html;       # 웹 루트 디렉토리
    index index.html;                 # 기본 인덱스 파일

    # 클라이언트 요청 제한 설정
    client_max_body_size 100M;         # 최대 업로드 크기 100MB로 제한
    ###########

     # SSE 연결을 위한 특별한 위치 설정
    location /api/notifications/subscribe {
        proxy_pass http://backend/notifications/subscribe;
        proxy_set_header Connection '';  # Connection 헤더 제거
        proxy_http_version 1.1;  # HTTP/1.1 사용
        proxy_buffering off;  # 프록시 버퍼링 비활성화
        proxy_cache off;  # 캐싱 비활성화
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE를 위한 긴 타임아웃 설정
        proxy_read_timeout 86400s;  # 24시간
        proxy_send_timeout 86400s;  # 24시간
        proxy_connect_timeout 60s;

        # CORS 설정
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        
        # OPTIONS 요청 처리
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' '*';
            add_header 'Access-Control-Max-Age' 1728000;
            return 204;
        }
    }


    ###########

    # 기본 CORS 헤더 설정
    add_header 'Access-Control-Allow-Origin' '*';                          # 모든 도메인 허용
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';        # 허용할 HTTP 메서드
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization'; # 허용할 헤더

    # FastAPI 서버로의 프록시 설정
    location /fastapi/ {
        proxy_pass http://fastapi/;    # FastAPI 서버로 요청 전달
        
        # 프록시 헤더 설정
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 지원 설정
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

         # CORS 설정을 여기서는 제거하고 FastAPI에서만 처리하도록 함
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
    }

    # 스프링 부트 API 요청 처리 설정
    location /api/ {
        # 로깅 설정
        error_log /var/log/nginx/api_error.log debug;  # 에러 로그
        access_log /var/log/nginx/api_access.log;      # 접근 로그

        # 백엔드 서버로 프록시
        proxy_pass http://backend/;    # 백엔드 서버로 요청 전달
        
        # 프록시 버퍼 설정
        proxy_buffers 16 32k;          # 버퍼 크기 및 개수
        proxy_buffer_size 32k;         # 초기 버퍼 크기
        
        # 프록시 헤더 설정
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정 (300초)
        proxy_connect_timeout 300;     # 연결 타임아웃
        proxy_send_timeout 300;        # 전송 타임아웃
        proxy_read_timeout 300;        # 읽기 타임아웃

        # CORS 프리플라이트 요청 처리
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' '*' always;
            add_header 'Access-Control-Max-Age' 1728000 always;  # 프리플라이트 캐시 시간 (20일)
            return 204;  # No Content 응답
        }

        # 일반 요청에 대한 CORS 헤더
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
    }

    # 정적 파일 처리 설정
    location ~* \.(js|css|html|jpg|jpeg|png|gif|ico)$ {
        try_files $uri =404;           # 파일이 없으면 404 에러
    }

    # SPA를 위한 기본 라우팅 설정
    location / {
        try_files $uri $uri/ /index.html;  # SPA 라우팅을 위한 폴백
    }

    # 검색엔진 크롤러 차단 설정
    location /robots.txt {
        return 200 "User-agent: *\nDisallow: /";  # 모든 봇의 접근을 차단
    }
}

```

실행 후 Jenkins 설정.  

- Item 생성?
- Plugins 설치



## 4. BE
### application.yml

```
spring:
  profiles:
    include: oauth
  config:
    import: optional:file:.env[.properties]
  application:
    name: spring-server
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    hikari:
      maximum-pool-size: 30           # 최대 커넥션 풀 크기
      minimum-idle: 10                # 최소 유휴 커넥션 수
      connection-timeout: 300000      # 커넥션 타임아웃 (300초 = 5분)
      idle-timeout: 600000           # 유휴 커넥션 타임아웃 (10분)
      max-lifetime: 1800000          # 커넥션 최대 수명 (30분)
  jpa:
    properties:
      hibernate.format_sql: true
      dialect: org.hibernate.dialect.MySQL8InnoDBDialect
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB
  kafka:
    bootstrap-servers: ${BOOTSTRAP_SERVER}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        spring.json.trusted.packages: "*"
        message.max.bytes: 52428800  # 50MB
        max.request.size: 52428800   # 50MB를 bytes로 변환
        buffer.memory: 52428800

    consumer:
      group-id: voice-analysis-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
        fetch.message.max.bytes: 52428800     # 50MB
        max.partition.fetch.bytes: 52428800

  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}
      password: ${REDIS_PASSWORD}
      repositories:
        enabled: false


server:
  port: 8081  # 원하는 포트 번호로 변경



cloud:
  aws:
    s3:
      bucket: fixspeech
    stack.auto: false
    region.static: us-east-1
    credentials:
      accessKey: ${S3_ACCESS_KEY}
      secretKey: ${S3_SECRET_KEY}


jwt:
  secret:
    key: ${JWT_SECRET_KEY}
  access-token:
    expiration: ${JWT_ACCESS_TOKEN_EXPIRATION}
  refresh-token:
    expiration: ${JWT_REFRESH_TOKEN_EXPIRATION}
  oauth:
    access-token:
      expiration: ${JWT_OAUTH_ACCESS_TOKEN_EXPIRATION}
    refresh-token:
      expiration: ${JWT_OAUTH_REFRESH_TOKEN_EXPIRATION}
      cookie:
        domain: ${JWT_OAUTH_REFRESH_TOKEN_COOKIE_DOMAIN}
frontend:
  url: ${FRONTEND_URL}

cors:
  allowed-origin: ${CORS_ALLOWED_ORIGIN}
  allowed-methods: ${CORS_ALLOWED_METHODS}

youtube:
  api:
    key: ${YOUTUBE_KEY}

```
### Dockerfile

```
FROM openjdk:17-jdk-alpine

# 작업 디렉토리 설정
WORKDIR = /app

COPY . .

RUN ls -al

RUN pwd
# Gradle 빌드
RUN rm -rf .gradle
RUN ls -al
RUN chmod +x ./gradlew
#RUN ./gradlew clean build
RUN ./gradlew clean build -x test


RUN ls -al ./build/libs/
RUN cp ./build/libs/app-0.0.1-SNAPSHOT.jar ./build/libs/app.jar

RUN ls -al ./build/libs/
RUN cp ./build/libs/app.jar ./app.jar
RUN ls -al
#COPY ./build/libs/farmer.jar ./app.jar

ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "./app.jar"]

# .env 파일 복사
COPY src/main/resources/.env src/main/resources/.env
```

 Docker container 실행
```
docker run -d --name spring-contianer \
-p 8081:8081 \
--network app-network
semonemo
```
### build.gradle

```
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.4'
    id 'io.spring.dependency-management' version '1.1.6'
}

group = 'com.fixspeech'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'

    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.cloud:spring-cloud-starter-aws:2.2.6.RELEASE'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    // QueryDsl
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor "com.querydsl:querydsl-apt:5.0.0:jakarta"
    annotationProcessor "jakarta.annotation:jakarta.annotation-api"
    annotationProcessor "jakarta.persistence:jakarta.persistence-api"

    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    implementation 'io.jsonwebtoken:jjwt-impl:0.12.3'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.data:spring-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'


    implementation 'me.paulschwarz:spring-dotenv:4.0.0'
    implementation 'org.redisson:redisson-spring-boot-starter:3.35.0'

    //youtube
    // https://mvnrepository.com/artifact/com.google.api-client/google-api-client
    implementation 'com.google.api-client:google-api-client:2.6.0'

    implementation 'com.google.oauth-client:google-oauth-client-jetty:1.23.0'
    implementation 'com.google.apis:google-api-services-youtube:v3-rev20230816-2.0.0'
    implementation 'com.google.http-client:google-http-client-jackson2:1.39.2'

    // kafka
    implementation 'org.springframework.kafka:spring-kafka'

    compileOnly 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    runtimeOnly 'com.mysql:mysql-connector-j'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}

```
### MySQL

MySQL Docker Volume 생성

```
docker volume create mysql-volume
```
MySQL 컨테이너 실행
```
docker run --rm -d --name mysql-container \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=mysqlPasssword\
-v mysql-volume:/var/lib/mysql \
mysql
```
### Kafka

kafka-compose.yml 생성
```
version: '3.8'
services:
  zookeeper:
    image: wurstmeister/zookeeper:latest
    container_name: zookeeper
    ports:
      - "2181:2181"
  kafka:
    image: wurstmeister/kafka:latest
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 127.0.0.1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```
 yml 실행
```
$ kafka-compose up -d
```
### Redis

redis.conf 파일 생성

```
# 연결 가능한 네트위크(0.0.0.0 = Anywhere)
bind 0.0.0.0

# 연결 포트
port 6379

# Master 노드의 기본 사용자 비밀번호
requirepass {사용할 Redis 비밀번호}

# 최대 사용 메모리 용량(지정하지 않으면 시스템 전체 용량)
maxmemory 2gb

# 설정된 최대 사용 메모리 용량을 초과했을때 처리 방식
# - noeviction : 쓰기 동작에 대해 error 반환 (Default)
# - volatile-lru : expire 가 설정된 key 들중에서 LRU algorithm 에 의해서 선택된 key 제거
# - allkeys-lru : 모든 key 들 중 LRU algorithm에 의해서 선택된 key 제거
# - volatile-random : expire 가 설정된 key 들 중 임의의 key 제거
# - allkeys-random : 모든 key 들 중 임의의 key 제거
# - volatile-ttl : expire time(TTL)이 가장 적게 남은 key 제거 (minor TTL)
maxmemory-policy volatile-ttl

# == RDB 관련 설정 ==

# 15분 안에 최소 1개 이상의 key가 변경 되었을 때
save 900 1
# 5분 안에 최소 10개 이상의 key가 변경 되었을 때
save 300 10
# 60초 안에 최소 10000개 이상의 key가 변경 되었을 때
save 60 10000
```
Redis 컨테이너 실행

```
docker run --restart=always -d --name redis-container 
>> -p 6379:6379 
>> -v {redis.conf PATH}:/etc/redis/redis.conf 
>> -v /var/lib/docker/volumes/redis_data/_data:/data 
>> redis:latest `
>> redis-server /etc/redis/redis.conf
```

---



## 5. CI/CD

#### 젠킨스 도커 이미지 다운

```
docker pull jenkins/jenkins:lts
```

#### 젠킨스 컨테이너 띄우기

```
sudo docker run -d -p 9090:8080 -v /jenkins:/var/jenkins_home --name jenkins -u root jenkins/jenkins:lts
```

#### Jenkins Pipeline

```
pipeline{
	agent any

  stages{
      stage('dev'){
          steps{
              git branch: 'dev',
              credentialsId: 'KBS-Git', 
              url: "https://lab.ssafy.com/s11-final/S11P31D206.git"
              } 
      }

      stage('Build Front') {
          steps {
              dir('/var/jenkins_home/workspace/FIXSPEECH/frontend/'){
                  withCredentials([file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')]) {
                      sh '''
                          chmod 777 .
                          cp $FRONTEND_ENV .env
                      '''
                      sh 'ls -al'
                      
                      sh 'docker ps -a'
                      // react_container 존재하면 멈추고 삭제하기
                      sh '''
                        if [ "$(docker ps -aq -f name=react_container)" ]; then
                              docker stop react_container
                              docker rm react_container
                          fi
                      '''
                      
                      // 'react-image'이라는 이미지가 존재하는지 확인하고 삭제
                      sh '''
                          if [ "$(docker images -q react-image 2> /dev/null)" != "" ]; then
                              docker rmi react-image
                          fi
                      '''

                      // sh 'docker build --no-cache -t react-image .' // no-cache 옵션 제거
                       sh 'docker build -t react-image .'
                      // 위 명령어까지 진행되면 
                      
                      // 컨테이너가 존재하면 삭제
                      sh '''
                  if [ "$(docker ps -aq -f name=react_container)" ]; then
                      docker rm -f react_container
                  fi
                  '''
                  // 새로운 컨테이너 생성
                  sh '''
                  docker run -d --name react_container \
                    -p 80:80 \
                    -p 443:443 \
                    -v /home/ubuntu/https/data/certbot/conf/live/k11d206.p.ssafy.io/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro \
                    -v /home/ubuntu/https/data/certbot/conf/live/k11d206.p.ssafy.io/privkey.pem:/etc/nginx/ssl/privkey.pem:ro \
                    react-image
                  '''
              }
          }
        }
      }
      
      stage('Build FastAPI') {
          steps {
              dir('/var/jenkins_home/workspace/FIXSPEECH/backend/fast-api-audio/') {
                  withCredentials([file(credentialsId: 'fastapi-env', variable: 'FASTAPI_ENV')]) {
                      sh 'cp $FASTAPI_ENV .env'
                      sh 'ls -al'
                      
                      // 기존 컨테이너 정리
                      sh '''
                          if [ "$(docker ps -aq -f name=fastapi_container)" ]; then
                              docker stop fastapi_container
                              docker rm fastapi_container
                          fi
                      '''
                      
                      // 기존 이미지 정리
                      sh '''
                          if [ "$(docker images -q fastapi-image 2> /dev/null)" != "" ]; then
                              docker rmi fastapi-image
                          fi
                      '''

                      // 새 이미지 빌드 및 실행
                      // sh 'docker build --no-cache -t fastapi-image .' // no-cache 옵션 제거
                      sh 'docker build -t fastapi-image .'
                      sh 'docker run -d --name fastapi_container -p 8000:8000 fastapi-image'
                  }
              }
          }
      }
      
      // stage('env file download and play cp execute') {
      //     steps {
      //         withCredentials([file(credentialsId: 'env', variable: 'envfile')]) {
      //             script {
      //                 sh '''
      //                     if [ -f /var/jenkins_home/workspace/FIXSPEECH/backend/spring-server/src/main/resources/.env ]; then
      //                         rm /var/jenkins_home/workspace/FIXSPEECH/backend/spring-server/src/main/resources/.env
      //                     fi
      //                 '''
      //                 sh 'cp $envfile /var/jenkins_home/workspace/FIXSPEECH/backend/spring-server/src/main/resources/.env'
      //             }
      //         }
      //     }
      // }
      
      stage('Build Backend'){
          steps {
              dir('/var/jenkins_home/workspace/FIXSPEECH/backend/spring-server/'){
                  withCredentials([file(credentialsId: 'spring-env', variable: 'SPRING_ENV')]) {
                      sh 'cp $SPRING_ENV src/main/resources/.env'
                      sh 'ls -al'
                      sh 'whoami'
                      
                      sh 'groups jenkins'
                      sh 'docker ps -a'
                      // my_container가 존재하면 멈추고 삭제하기
                      sh '''
                        if [ "$(docker ps -aq -f name=my_container)" ]; then
                              docker stop my_container
                              docker rm my_container
                          fi
                      '''
                      
                      // 'tem'이라는 이미지가 존재하는지 확인하고 삭제
                      sh '''
                          if [ "$(docker images -q tem 2> /dev/null)" != "" ]; then
                              docker rmi tem
                          fi
                      '''

                      sh 'docker build -t tem .'
                      // 위 명령어까지 진행되면 

                      // 컨테이너가 존재하면 삭제
                      sh '''
                      if [ "$(docker ps -aq -f name=my_container)" ]; then
                          docker rm -f my_container
                      fi
                      '''
                      // 새로운 컨테이너 생성
                      sh 'docker run -d --name my_container -p 8081:8081 tem'
                  }
              }
          }
      }
      

      stage('Notification') {
          steps {
              echo 'jenkins notification!'
          }
      }
  }

  post {
      success {
          script {
              def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
              def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
              mattermostSend(
                  color: 'good',
                  message: "빌드 성공: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)",
                  endpoint: 'https://meeting.ssafy.com/hooks/tnjfriwoejrt7ypg4d6d6njn7o',
                  channel: 'D206-Build-Alert'
              )
          }
      }
      failure {
          script {
              def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
              def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
              mattermostSend(
                  color: 'danger',
                  message: "빌드 실패: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)",
                  endpoint: 'https://meeting.ssafy.com/hooks/tnjfriwoejrt7ypg4d6d6njn7o',
                  channel: 'D206-Build-Alert'
              )
          }
      }
  }
}

```





---



# 버전

### Backend
- OpenJDK : 17
- Spring : 3.3.4
- Nginx : 1.27.2
- MySQL : 8.0.21
- FastAPI : 0.104.1

### CI/CD
- Jenkins : jenkins/jenkins:2.482-jdk17
- docker : 24.0.7
- docker compose : 2.30.1

### Front
- React 18.3.1

<br>

---
# 외부 서비스
<br>

- 카카오 Oauth
- Youtube Data V3 API
- ChatGPT API

<br>

---
# 환경변수

frontend/.env

```
VITE_API_URL=your_api_url
VITE_FASTAPI_URL=your_fastapi_url
VITE_OPENAI_API_KEY=your_openai_api_key
```

backend/spring-server/source/main/resources/.env

```
# DB
## MySql
DATABASE_URL=jdbc:mysql://www.example.com:3306/fixspeech?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# Server
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
REDIS_HOST=www.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# kakfa
BOOTSTRAP_SERVER=www.example.com:9092

# JWT
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRATION=3600000 # 1시간
JWT_REFRESH_TOKEN_EXPIRATION=86400000 # 1일

JWT_OAUTH_ACCESS_TOKEN_EXPIRATION=3600000 # 1시간
JWT_OAUTH_REFRESH_TOKEN_EXPIRATION=86400000 # 1일
JWT_OAUTH_REFRESH_TOKEN_COOKIE_DOMAIN=www.example.com

# OAuth
## Common
OAUTH_BASE_URL=https://www.example.com/api

## Kakao
### REST_API 키
KAKAO_CLIENT=your_kakao_client_key
### Client Secret
KAKAO_SECRET=your_kakao_secret_key

# URL
FRONTEND_URL=https://www.example.com

# CORS
CORS_ALLOWED_ORIGIN=https://www.example.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Youtube
YOUTUBE_KEY=your_youtube_api_key
```

backend/fast-api-audio/.env

```
# CORS Settings
ALLOWED_ORIGINS=https://www.example.com
```

