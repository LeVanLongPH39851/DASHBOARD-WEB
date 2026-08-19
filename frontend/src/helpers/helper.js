import { toPng } from "html-to-image";
import html2canvas from "html2canvas-pro";
import { LABEL_TABS } from "../utils/label";

export const getYesterday = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()); // 2 chữ số cuối
  return `${day}/${month}/${year}`;
};

// Format timestamp -> dd/MM/yyyy HH:mm
export const formatDateTime = (timestamp) => {
  timestamp = timestamp - 7 * 60 * 60 * 1000;
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getDayBeforeYesterday = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 2);
  return yesterday.toISOString().split('T')[0];
};

export const generateRandomId = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomPart = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const timestamp = Date.now();
  return `${randomPart}_${timestamp}`;
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const prepareCaptureLayout = () => {
    const inforTabSticky = document.getElementById("inforTabSticky");
    const inforFilterSticky = document.getElementById("inforFilterSticky");
    const divTables = document.querySelectorAll(".divTable");
    const exportTime = document.getElementById("exportTime");
    const clearAll = document?.getElementById("clearAll");
    const inforFilterBtn = document.querySelector(
      "#inforFilter div:first-child",
    );

    inforFilterBtn.classList.add("hidden");
    sleep(300);
    inforTabSticky?.classList.replace("transition-all", "transition-delete");
    inforFilterSticky?.classList.replace("transition-all", "transition-delete");
    inforTabSticky?.classList.replace("duration-300", "duration-delete");
    inforFilterSticky?.classList.replace("duration-300", "duration-delete");

    const originalInforTabTop = inforTabSticky?.style.top ?? "";
    const originalInforFilterTop = inforFilterSticky?.style.top ?? "";

    if (inforTabSticky) inforTabSticky.style.top = "0px";
    if (inforFilterSticky) {
      const inforTabHeight = inforTabSticky?.getBoundingClientRect()?.height.toFixed(2) ?? 0;
      inforFilterSticky.style.top = `${inforTabHeight}px`;
    }

    if (clearAll) clearAll.classList.add("hidden");
    divTables.forEach((table) =>
      table?.classList.replace("overflow-auto", "overflow-hidden"),
    );

    const now = new Date();
    const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    if (exportTime) exportTime.textContent = timeStr;

    return {
      inforTabSticky,
      inforFilterSticky,
      originalInforTabTop,
      originalInforFilterTop,
      clearAll,
      divTables,
      exportTime,
      inforFilterBtn,
      now,
    };
};

export const restoreCaptureLayout = ({
  inforTabSticky,
  inforFilterSticky,
  originalInforTabTop,
  originalInforFilterTop,
  clearAll,
  divTables,
  exportTime,
  inforFilterBtn,
}) => {
  inforTabSticky?.classList.replace("transition-delete", "transition-all");
  inforFilterSticky?.classList.replace("transition-delete", "transition-all");
  inforTabSticky?.classList.replace("duration-delete", "duration-300");
  inforFilterSticky?.classList.replace("duration-delete", "duration-300");
  if (inforTabSticky) inforTabSticky.style.top = originalInforTabTop;
  if (inforFilterSticky) inforFilterSticky.style.top = originalInforFilterTop;
  inforFilterBtn.classList.remove("hidden");
  if (clearAll) clearAll.classList.remove("hidden");
  divTables?.forEach((table) =>
    table?.classList.replace("overflow-hidden", "overflow-auto"),
  );
  if (exportTime) exportTime.textContent = "";
};

export const waitForNextPaint = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
);

export const handleCapture = async (currentTab) => {
  const target = document.getElementById(`target_capture_${currentTab}`);
  if (!target) return;

  const inforTabSticky = document.getElementById("inforTabSticky");
  const inforFilterSticky = document.getElementById("inforFilterSticky");
  const divTables = document.querySelectorAll(".divTable");
  const exportTime = document?.getElementById("exportTime");
  const clearAll = document?.getElementById("clearAll");
  const inforFilterBtn = document.querySelector(
    "#inforFilter div:first-child",
  );

  inforTabSticky.classList.replace("transition-all", "transition-delete");
  inforFilterSticky.classList.replace("transition-all", "transition-delete");
  inforTabSticky.classList.replace("duration-300", "duration-delete");
  inforFilterSticky.classList.replace("duration-300", "duration-delete");

  const originalInforTabTop = inforTabSticky.style.top ?? "";
  const originalInforFilterTop = inforFilterSticky.style.top ?? "";

  inforTabSticky.style.top = "0px";
  inforFilterSticky.style.top = `${inforTabSticky.getBoundingClientRect().height.toFixed(2)}px`;

  inforFilterBtn.classList.add("hidden");
  await sleep(300);
  if (clearAll) clearAll.classList.add("hidden");
  divTables.forEach((table) =>
    table?.classList.replace("overflow-auto", "overflow-hidden"),
  );
  const now = new Date();

  const timeStr = `Thời gian xuất: ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  exportTime.textContent = timeStr;

  const dataUrl = await toPng(target, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: null,
  });

  const link = document.createElement("a");
  const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}m${String(now.getSeconds()).padStart(2, "0")}s`;
  link.download = `Report Dashboard VTVRatings ${LABEL_TABS[currentTab]} ${dateStr}.png`;
  link.href = dataUrl;
  link.click();

  inforTabSticky.classList.replace("transition-delete", "transition-all");
  inforFilterSticky.classList.replace("transition-delete", "transition-all");
  inforTabSticky.classList.replace("duration-delete", "duration-300");
  inforFilterSticky.classList.replace("duration-delete", "duration-300");
  inforTabSticky.style.top = originalInforTabTop;
  inforFilterSticky.style.top = originalInforFilterTop;
  inforFilterBtn.classList.remove("hidden");
  if (clearAll) clearAll.classList.remove("hidden");
  divTables.forEach((table) =>
    table?.classList.replace("overflow-hidden", "overflow-auto"),
  );
  exportTime.textContent = "";
};

export const handlePDF = async (currentTab) => {
  const target = document.getElementById(`target_capture_${currentTab}`);

  if (!target) {
    console.error("Không tìm thấy target element");
    return;
  }

  const inforTabSticky = document.getElementById("inforTabSticky");
  const inforFilterSticky = document.getElementById("inforFilterSticky");
  const divTables = document.querySelectorAll(".divTable");
  const exportTime = document?.getElementById("exportTime");
  const clearAll = document?.getElementById("clearAll");
  const inforFilterBtn = document.querySelector(
    "#inforFilter div:first-child",
  );

  inforFilterBtn.classList.add("hidden");
  await sleep(300);
  inforTabSticky.classList.replace("transition-all", "transition-delete");
  inforFilterSticky.classList.replace("transition-all", "transition-delete");
  inforTabSticky.classList.replace("duration-300", "duration-delete");
  inforFilterSticky.classList.replace("duration-300", "duration-delete");

  const originalInforTabTop = inforTabSticky.style.top ?? "";
  const originalInforFilterTop = inforFilterSticky.style.top ?? "";

  inforTabSticky.style.top = "0px";
  inforFilterSticky.style.top = `${inforTabSticky.getBoundingClientRect().height.toFixed(2)}px`;

  if (clearAll) clearAll.classList.add("hidden");
  divTables.forEach((table) =>
    table?.classList.replace("overflow-auto", "overflow-hidden"),
  );
  const now = new Date();

  const timeStr = `Thời gian xuất: ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  exportTime.textContent = timeStr;

  try {
    // ✅ CONFIG GIỐNG HỆT handleCapture
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}m${String(now.getSeconds()).padStart(2, "0")}s`;

    // ✅ FIX jsPDF: Tạo PDF đơn giản 1 trang, KHÔNG multi-page
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;

    // scale để fit TRỌN 1 trang
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    // canh giữa
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
    pdf.save(
      `Report Dashboard VTVRatings ${LABEL_TABS[currentTab]} ${dateStr}.pdf`,
    );
  } catch (error) {
    console.error("❌ Lỗi tạo PDF:", error);
  } finally {
    inforTabSticky.classList.replace("transition-delete", "transition-all");
    inforFilterSticky.classList.replace("transition-delete", "transition-all");
    inforTabSticky.classList.replace("duration-delete", "duration-300");
    inforFilterSticky.classList.replace("duration-delete", "duration-300");
    inforTabSticky.style.top = originalInforTabTop;
    inforFilterSticky.style.top = originalInforFilterTop;
    inforFilterBtn.classList.remove("hidden");
    if (clearAll) clearAll.classList.remove("hidden");
    divTables.forEach((table) =>
      table?.classList.replace("overflow-hidden", "overflow-auto"),
    );
    exportTime.textContent = "";
  }
};

export const handleCaptureFireFox = async (currentTab) => {
  const target = document.getElementById(`target_capture_${currentTab}`);
  if (!target) return;

  const layoutState = prepareCaptureLayout();
  try {
    await waitForNextPaint();
    const canvas = await html2canvas(target, {
      scale: isFirefox ? 1.5 : 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/png");
    const { now } = layoutState;
    const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}m${String(now.getSeconds()).padStart(2, "0")}s`;
    const link = document.createElement("a");
    link.download = `Report Dashboard VTVRatings ${LABEL_TABS[currentTab]} ${dateStr}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Lỗi export PNG:", error);
  } finally {
    restoreCaptureLayout(layoutState);
  }
};

export const handlePDFFireFox = async (currentTab) => {
  const target = document.getElementById(`target_capture_${currentTab}`);
  if (!target) return;

  const layoutState = prepareCaptureLayout();

  try {
    await waitForNextPaint();

    const canvas = await html2canvas(target, {
      scale: isFirefox ? 1.5 : 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = await import("jspdf");
    const { now } = layoutState;

    // ✅ Tự chọn orientation theo canvas
    const orientation = canvas.width > canvas.height ? "l" : "p";
    const pdf = new jsPDF(orientation, "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;

    // ✅ Luôn fit cả width và height, không bị cắt
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    // ✅ Canh giữa
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);

    const dateStr =
      `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()} ` +
      `${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}m${String(now.getSeconds()).padStart(2, "0")}s`;

    const fileName = `Report Dashboard VTVRatings ${LABEL_TABS[currentTab]} ${dateStr}.pdf`;

    if (isFirefox) {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      pdf.save(fileName);
    }
  } catch (error) {
    console.error("Lỗi tạo PDF:", error);
  } finally {
    restoreCaptureLayout(layoutState);
  }
};