export const getTrendText = (changeValue: any) => {
  if (changeValue > 0) {
    return {
      text: `전월 대비 +${changeValue.toLocaleString()}`,
      color: "#4caf50",
    };
  } else if (changeValue < 0) {
    return {
      text: `전월 대비 ${changeValue.toLocaleString()}`,
      color: "#f44336",
    };
  } else {
    return {
      text: "변동 없음",
      color: "#757575",
    };
  }
};

export const getRevenueTrendText = (changeValue: any) => {
  if (changeValue > 0) {
    return {
      text: `전월 대비 +₩${changeValue.toLocaleString()}`,
      color: "#4caf50",
    };
  } else if (changeValue < 0) {
    return {
      text: `전월 대비 -₩${Math.abs(changeValue).toLocaleString()}`,
      color: "#f44336",
    };
  } else {
    return {
      text: "변동 없음",
      color: "#757575",
    };
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
