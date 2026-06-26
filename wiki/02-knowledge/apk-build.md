---
id: HERMES-APK-001
title: Capacitor Android APK 打包
type: workflow
tags: [build, apk, android, capacitor]
use_cases: ["APK怎么打", "Android打包", "Capacitor构建"]
source: fact_store#121, fact_store#117, fact_store#71
related_skill: software-development/capacitor-android-build
related_skill_alt: software-development/flutter-apk-build
trust: 0.95
last_updated: 2026-06-26
---
# Capacitor Android APK 构建

## 环境
- JDK：C:\Program Files\Microsoft\jdk-21.0.6.7-hotspot
- Android SDK：D:\Android
- Gradle：项目下 android\gradlew.bat
- Cap CLI：node_modules\.bin\cap.cmd

## 打包流程
1. 改完代码
2. `npm install`（如需新插件）
3. `npx cap sync android`（同步www到android assets）
4. `cd android && set JAVA_HOME && set ANDROID_HOME && gradlew.bat assembleDebug`
5. APK输出：`android\app\build\outputs\apk\debug\app-debug.apk`

## 注意事项
- 旧脚本写死 D:\xyy-app 已过时，真实项目在 D:\文档\数据库总文件夹\项目工作区\概念小卡片\
- capacitor.config.json 的 webDir=www
- 构建用时约29秒






