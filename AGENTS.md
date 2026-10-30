# Agent Guidelines & Workflow - DeviceManagement v1.2

## 1. Project Overview & Architecture

* **Backend (`backend/DeviceManagement.Api`)**:
  * Framework: .NET 7 (`net7.0`), ASP.NET Core Web API, Entity Framework Core 7.0.14.
  * Database: SQL Server (`DESKTOP-GL89FUU\SQLEXPRESS01`, DB: `DeviceManagement_V1_2`).
  * Port: `http://localhost:5000` (Swagger UI: `http://localhost:5000/swagger/index.html`).
  * Build: `dotnet build backend/DeviceManagement.Api/DeviceManagement.Api.csproj`
  * Run: `$env:ASPNETCORE_ENVIRONMENT="Development"; dotnet run --project backend/DeviceManagement.Api/DeviceManagement.Api.csproj`
* **Frontend (`frontend/`)**:
  * Framework: React 19, TypeScript, Vite.
  * Port: `http://localhost:5173` (CORS allows 5173 & 5174).
  * Build: `npm --prefix frontend run build`
  * Dev: `npm --prefix frontend run dev`
* **Authentication & Roles**:
  * Protocol: JWT Bearer.
  * Roles:
    * `Admin`: Quản trị viên (quản lý người dùng, thiết bị, bàn giao thiết bị, thu hồi).
    * `Employee`: Nhân viên thông thường (xem thiết bị, tiếp nhận / từ chối / hoàn trả thiết bị được bàn giao).

---

## 2. Mandatory Task Execution Workflow

Mọi task phát triển, sửa lỗi hoặc tính năng mới **bắt buộc** phải tuân thủ nghiêm ngặt quy trình 8 bước:

```text
1. Analyze ──► 2. Implement ──► 3. Build ──► 4. API Test ──► 5. Browser Test ──► 6. Fix ──► 7. Retest ──► 8. Report
```

1. **Analyze (Phân tích)**:
   * Đọc kỹ yêu cầu, khảo sát các file liên quan (controller, service, model, DTO, page component).
   * Không đưa ra giả định về port hay cấu hình mà phải kiểm tra file thực tế.
2. **Implement (Thực thi mã nguồn)**:
   * Thực hiện chỉnh sửa chính xác, tối thiểu và an toàn.
   * Giữ nguyên các comment và tài liệu hiện có không liên quan đến thay đổi.
3. **Build (Kiểm tra biên dịch)**:
   * Backend: Chạy `dotnet build backend/DeviceManagement.Api/DeviceManagement.Api.csproj` -> Phải đạt `0 Error(s)`.
   * Frontend: Chạy `npm --prefix frontend run build` (hoặc `tsc`) nếu có thay đổi frontend.
4. **API Test (Kiểm thử API Backend)**:
   * Đảm bảo backend đang chạy tại `http://localhost:5000`.
   * Kiểm tra tính hợp lệ của endpoint qua Swagger JSON (`http://localhost:5000/swagger/v1/swagger.json`) hoặc gửi HTTP request kiểm chứng mã phản hồi (`200 OK`, `400 Bad Request`, `401 Unauthorized`,...).
5. **Browser Test (Kiểm thử Browser qua Chrome DevTools MCP)**:
   * **Bắt buộc:** Chỉ sử dụng công cụ **Chrome DevTools MCP** (`call_mcp_tool` với `ServerName: "chrome-devtools"`).
   * Sử dụng `navigate_page` để mở trang, `take_snapshot` để đọc DOM/a11y tree, `click`/`fill` để tương tác, `list_console_messages` và `list_network_requests` để xác nhận không có lỗi JavaScript hoặc HTTP 500.
   * **Không bao giờ** chỉ dùng HTTP status 200 để kết luận browser UI hoạt động.
6. **Fix (Khắc phục lỗi nếu phát sinh)**:
   * Nếu có lỗi trong quá trình Build, API Test hoặc Browser Test, phân tích log thực tế và sửa lỗi ngay tại bước này.
7. **Retest (Kiểm thử lại)**:
   * Lặp lại các bước Build, API Test và Browser Test cho đến khi toàn bộ lỗi được khắc phục.
8. **Report (Báo cáo)**:
   * Báo cáo đầy đủ: File đã sửa/tạo, kết quả build, log API, log browser DevTools và bằng chứng thực thi.
   * Chỉ báo **DONE** khi tất cả các bước trên đã được kiểm chứng bằng thực tế.

---

## 3. Quy tắc an toàn & Ràng buộc bảo mật

1. **Bảo vệ cơ sở dữ liệu**:
   * Tuyệt đối **KHÔNG** chạy các script reset database, drop database (`drop_database.sql`, `reset_database.sql`) hoặc migration phá hủy dữ liệu.
   * Chỉ thao tác thêm/sửa dữ liệu phục vụ test theo đúng nghiệp vụ API.
2. **Bảo vệ thông tin đăng nhập (Credentials)**:
   * Tuyệt đối **KHÔNG** lưu mật khẩu thực tế vào `AGENTS.md`, source code hoặc bất kỳ file nào được Git theo dõi.
   * Mẫu tài khoản test nằm tại `test-credentials.example.json`. Người dùng tự tạo file `test-credentials.local.json` (đã nằm trong `.gitignore`) trên máy cá nhân để chạy test tự động.
3. **Kiểm soát phiên bản (Git)**:
   * Tuyệt đối **KHÔNG** tự ý thực hiện `git commit` hoặc `git push` trừ khi người dùng yêu cầu rõ ràng.
4. **Phạm vi công việc**:
   * Không tự ý tạo thêm các màn hình frontend hoặc module nghiệp vụ nằm ngoài phạm vi của task được giao.
