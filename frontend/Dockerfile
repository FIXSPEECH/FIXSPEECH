# 가져올 이미지를 정의
FROM node:20 AS builder

# 경로 설정하기
WORKDIR /app

# package.json 워킹 디렉토리에 복사
COPY package.json package-lock.json ./

# 명령어 실행 (의존성 설치)
RUN npm install
# 애플리케이션 소스 코드 복사
COPY . .

RUN npm run build


FROM nginx:alpine
# Nginx 설정 파일을 복사합니다.
COPY default.conf /etc/nginx/conf.d/default.conf
# Nginx가 수신 대기할 포트 노출
#EXPOSE 80
# 필요에 따라 Node.js 애플리케이션의 포트를 노출
EXPOSE 5173
RUN ls -al


COPY --from=builder /app/dist /usr/share/nginx/html
#RUN ls -al /usr/share/nginx/html/kiosk

#RUN ls -al /usr/share/nginx/html
CMD ["nginx", "-g","daemon off;"]