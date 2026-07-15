import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  obfuscatorPlugin({
    apply: 'build', // Chỉ làm rối khi build production, không làm khi đang dev (localhost)
    options: {
      compact: true, // Nén toàn bộ code thành 1 dòng duy nhất
      controlFlowFlattening: true, // Làm phẳng luồng kiểm soát (đảo lộn thứ tự if-else, vòng lặp)
      deadCodeInjection: true, // Tiêm code rác giả lập vào để đánh lạc hướng kẻ soi code
      debugProtection: true, // CHẶN F12: Tự động đóng băng hoặc treo trình duyệt nếu cố tình bật tab Console/Sources
      debugProtectionInterval: 2000, // Liên tục kiểm tra xem người dùng có đang F12 không mỗi 2 giây
      disableConsoleOutput: true, // Vô hiệu hóa toàn bộ lệnh console.log của ứng dụng
      stringArray: true, // Gom toàn bộ chuỗi string (như chữ 'vtvguest') đưa vào một mảng mã hóa
      stringArrayEncoding: ['base64'], // Mã hóa các chuỗi text thành định dạng Base64 để không bị tìm kiếm (Ctrl+F)
      splitStrings: true, // Cắt nhỏ các chuỗi chữ dài ra thành nhiều mẩu ký tự bé
      identifierNamesGenerator: 'hexadecimal' // Đổi tên toàn bộ biến, hàm thành mã Hex dạng _0x1a2b3c
    }
  })
  ]
})
