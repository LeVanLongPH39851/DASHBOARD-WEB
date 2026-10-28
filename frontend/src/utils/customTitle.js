const pathName = window.location.pathname;
const path = "/";
const origin = window.location.origin + path;
const favicon = document.getElementById("favicon");

switch (true) {
  case pathName.includes("/world-cup-2026"):
    document.title = "FIFA World Cup 2026";
    favicon.href = origin + path + "sites/icon_world_cup.png";
    break;

  case pathName.includes("/vietnam-today"):
    document.title = "VIETNAM TODAY";
    favicon.href = origin + path + "sites/logo_vietnamtoday.png";
    break;

  case pathName.includes("/rating"):
    document.title = "Kênh Truyền Hình VTV";
    break;

  case pathName.includes("/spot"):
    document.title = "Giám Sát Quảng Cáo";
    break;

  case pathName.includes("/brand"):
    document.title = "Báo Cáo Cho Nhãn Hàng";
    break;

  case pathName.includes("/survey"):
    document.title = "Khảo Sát";
    favicon.href = origin + path + "sites/logo_vietnamtoday.png";
    break;
}
