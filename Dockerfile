FROM node:20-alpine AS build

WORKDIR /app

# 환경변수를 ARG로 받기
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_SPRING_API_URL

# ARG를 ENV로 설정  
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_SPRING_API_URL=https://d3e5n07qpnkfk8.cloudfront.net

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Vite 빌드 (dist 폴더에 생성됨)
RUN npm run build

FROM nginx:alpine

# nginx 스테이지에서도 ARG 받기
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_SPRING_API_URL=https://d3e5n07qpnkfk8.cloudfront.net

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 포트 노출
EXPOSE 80

# nginx 시작
CMD ["nginx", "-g", "daemon off;"]
