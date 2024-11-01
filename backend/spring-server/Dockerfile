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