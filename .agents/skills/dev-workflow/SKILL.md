---
name: dev-workflow
description: Quy trình thực thi chuẩn 8 bước (Analyze -> Implement -> Build -> API Test -> Browser Test -> Fix -> Retest -> Report) cho project DeviceManagement v1.2. Kích hoạt khi thực hiện hoặc kiểm thử một task, tính năng mới hoặc sửa lỗi.
---

# DeviceManagement v1.2 Development Workflow

Runbook này hướng dẫn chi tiết từng bước khi nhận một task trong dự án `DeviceManagement v1.2`.

---

## Bước 1: Analyze (Khảo sát & Phân tích)
* Đọc kỹ yêu cầu nghiệp vụ.
* Kiểm tra các endpoint API bị ảnh hưởng trong `backend/DeviceManagement.Api/Controllers/`.
* Kiểm tra Entity và Database Mapping trong `backend/DeviceManagement.Api/Models/`.
* Kiểm tra frontend components trong `frontend/src/`.
* Xác nhận port thực tế: Backend `http://localhost:5000`, Frontend `http://localhost:5173`.

---

## Bước 2: Implement (Thực thi)
* Thực hiện thay đổi code tối thiểu, tập trung đúng vào yêu cầu.
* Không sửa database trực tiếp bằng SQL drop/truncate/reset.
* Không hardcode thông tin nhạy cảm (mật khẩu, connection string lạ).

---

## Bước 3: Build (Biên dịch)
* **Backend:**
  ```powershell
  dotnet build backend/DeviceManagement.Api/DeviceManagement.Api.csproj
  ```
  *Yêu cầu:* `Build succeeded. 0 Error(s)`.
* **Frontend:** (nếu có chỉnh sửa code frontend)
  ```powershell
  npm --prefix frontend run build
  ```
  *Yêu cầu:* Không có lỗi TypeCheck hoặc bundling.

---

## Bước 4: API Test (Kiểm thử API)
* Khởi chạy backend nếu chưa chạy:
  ```powershell
  $env:ASPNETCORE_ENVIRONMENT="Development"
  dotnet run --project backend/DeviceManagement.Api/DeviceManagement.Api.csproj --no-build
  ```
* Kiểm tra Swagger:
  * Truy cập `http://localhost:5000/swagger/v1/swagger.json`
  * Kiểm tra HTTP Status của các endpoint liên quan.

---

## Bước 5: Browser Test (Kiểm thử giao diện qua Chrome DevTools MCP)
* **Bắt buộc:** Chỉ sử dụng Chrome DevTools MCP (`call_mcp_tool` với `ServerName: "chrome-devtools"`):
  1. `navigate_page`: Mở URL cần test (`http://localhost:5000/swagger/index.html` hoặc frontend `http://localhost:5173`).
  2. `take_snapshot`: Lấy cây a11y DOM để kiểm tra trạng thái hiển thị của các thành phần UI.
  3. `click` / `fill`: Thực hiện thao tác tương tác (mở accordion, điền form test nếu có).
  4. `list_console_messages`: Kiểm tra log console để đảm bảo không có exception chưa bắt.
  5. `list_network_requests`: Kiểm tra các request API nền có mã trạng thái hợp lệ.
* **Cấm:** Không dùng curl / Invoke-WebRequest để thay thế cho việc kiểm thử browser.

---

## Bước 6: Fix (Sửa lỗi nếu phát sinh)
* Nếu có lỗi ở Bước 3, 4 hoặc 5:
  * Đọc log chi tiết (console log, build log, network failure).
  * Chỉnh sửa mã nguồn để khắc phục lỗi.

---

## Bước 7: Retest (Kiểm thử lại)
* Chạy lại toàn bộ chu trình: Build -> API Test -> Browser Test cho đến khi pass 100%.

---

## Bước 8: Report (Báo cáo kết quả)
* Cung cấp báo cáo gồm:
  1. Danh sách file đã tạo / chỉnh sửa.
  2. Bằng chứng Build (Exit code 0).
  3. Bằng chứng API Test (Mã trạng thái HTTP).
  4. Bằng chứng Browser Test (DOM snapshot, Console sạch, Network sạch).
  5. Bất kỳ điều kiện biên hoặc lưu ý nào chưa kiểm thử được.
* **Không kết luận DONE khi chưa hoàn thành bước kiểm thử thực tế.**
