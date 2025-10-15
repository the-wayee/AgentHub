# 第一阶段：构建
FROM docker.1ms.run/maven:3.9.6-amazoncorretto-17 AS build
# 使用aliyun镜像加速
COPY settings.xml /usr/share/maven/ref/
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -s /usr/share/maven/ref/settings.xml clean package -DskipTests

# 第二阶段：运行
FROM docker.1ms.run/eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
EXPOSE 8080
