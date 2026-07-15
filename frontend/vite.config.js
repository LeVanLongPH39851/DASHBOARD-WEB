import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  obfuscatorPlugin({
    apply: 'build',
    options: {
      compact: true,
      // 1. Làm phẳng luồng kiểm soát ở mức tuyệt đối (Nặng nhưng cực rối)
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1, // 100% các hàm đều bị bẻ gãy cấu trúc tuần tự

      // 2. Tiêm mã rác tối đa để đánh lừa công cụ dịch ngược
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1, // 100% file sẽ bị trộn lẫn với code giả

      // 3. Khóa F12 nâng cao (Tạo vòng lặp vô hạn làm treo tab Sources/Console)
      debugProtection: true,
      debugProtectionInterval: 1000, // Cứ mỗi 1 giây lại kích hoạt lệnh đóng băng trình duyệt
      disableConsoleOutput: true,

      // 4. Chuyển đổi toàn bộ tên biến/hàm thành mã Hex vô nghĩa
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: true, // Đổi tên cả các biến toàn cục (Cực kỳ khó đảo ngược)

      // 5. Mã hóa chuỗi chuỗi ký tự (Chuỗi 'vtvguest' sẽ biến mất hoàn toàn)
      stringArray: true,
      stringArrayEncoding: ['rc4'], // Sử dụng thuật toán RC4 thay vì Base64 để chống giải mã tĩnh
      stringArrayThreshold: 1, // 100% các chuỗi string trong code đều bị nén vào mảng mã hóa
      stringArrayWrappersCount: 5, // Bọc mảng mã hóa qua 5 lớp hàm trung gian để làm rối dấu vết
      stringArrayWrappersChaining: true, // Tạo chuỗi liên kết giữa các hàm bọc
      splitStrings: true,
      splitStringsChunkLength: 3, // Cắt nhỏ chữ 'vtvguest' thành từng mẩu 3 ký tự (vtv, gue, st) rồi mới mã hóa

      // 6. Biến đổi các phép toán số học và logic thành hệ nhị phân/thập lục phân
      transformObjectKeys: true, // Mã hóa cả các key của Object (ví dụ: user.username sẽ bị ẩn luôn chữ username)
      numbersToExpressions: true, // Biến số 1 thành (0x1a2b ^ 0x1a2a) để không thể dò số

      // 7. Chống sửa đổi file (Self Defending)
      selfDefending: true, // Nếu kẻ xấu cố tình format lại code cho dễ đọc hoặc sửa dù chỉ 1 ký tự, file sẽ tự hủy và dừng chạy hoàn toàn
    }
  })
  ]
})
