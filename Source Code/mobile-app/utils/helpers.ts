export const formatTimeElapsed = (hours: number): string => {
  if (hours < 1) {
    return "Vừa vào";
  } else if (hours < 24) {
    return `${hours} giờ`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days} ngày ${remainingHours} giờ`
      : `${days} ngày`;
  }
};

export const formatTimeElapsedDetailed = (
  minutes: number,
  seconds: number
): string => {
  if (minutes < 1) {
    return `${seconds} giây`;
  } else if (minutes < 60) {
    return `${minutes} phút ${seconds % 60} giây`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours} giờ ${remainingMinutes} phút ${seconds % 60} giây`;
    } else {
      return `${hours} giờ ${seconds % 60} giây`;
    }
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const calculateDuration = (
  checkIn: string,
  checkOut?: string | null
): string => {
  if (!checkIn) return "-";
  if (!checkOut) return "Đang gửi";

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
};

export const getCardTypeText = (cardType: number): string => {
  return cardType === 1 ? "Vé tháng" : "Vé thường";
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Đang gửi":
      return "#4CAF50";
    case "Đã checkout":
      return "#FF9800";
    default:
      return "#757575";
  }
};

export const calculateDaysRemaining = (
  expiryDate: string | null | undefined
): number | null => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const formatDaysRemaining = (days: number | null): string => {
  if (days === null) return "-";
  if (days === 0) return "Đã hết hạn";
  if (days === 1) return "1 ngày";
  return `${days} ngày`;
};
