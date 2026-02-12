@echo off
chcp 65001 >nul
echo ==========================================
echo   日报桌面应用 v1.0.0 发布脚本
echo ==========================================
echo.

REM 检查是否有未提交的更改
git status -s >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  无法检查 Git 状态
    pause
    exit /b 1
)

echo 📝 步骤 1/4: 提交所有更改...
git add .
git commit -m "Release v1.0.0"

if %errorlevel% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)
echo ✅ 提交成功
echo.

echo 🚀 步骤 2/4: 推送到远程仓库...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ 推送失败
    pause
    exit /b 1
)
echo ✅ 推送成功
echo.

echo 🏷️  步骤 3/4: 创建 tag v1.0.0...
git tag -a v1.0.0 -m "Release v1.0.0"

if %errorlevel% neq 0 (
    echo ❌ Tag 创建失败
    pause
    exit /b 1
)
echo ✅ Tag 创建成功
echo.

echo 📤 步骤 4/4: 推送 tag 到远程仓库...
git push origin v1.0.0

if %errorlevel% neq 0 (
    echo ❌ Tag 推送失败
    pause
    exit /b 1
)
echo ✅ Tag 推送成功
echo.

echo ==========================================
echo   🎉 发布流程已启动！
echo ==========================================
echo.
echo 接下来：
echo 1. 访问 GitHub Actions 查看构建进度
echo    https://github.com/你的用户名/daily-app/actions
echo.
echo 2. 等待构建完成（约 10-20 分钟）
echo.
echo 3. 查看 Release 页面
echo    https://github.com/你的用户名/daily-app/releases
echo.
echo 4. 下载并测试安装包
echo.
echo 祝发布顺利！🚀
echo.
pause
