export function mockParkingData(licensePlate: string) {
  const entryDate = new Date();
  entryDate.setHours(entryDate.getHours() - 3);
  entryDate.setMinutes(entryDate.getMinutes() - 15);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 15);

  return {
    licensePlate: licensePlate,
    plateImage:
      "https://placeholder.svg?height=180&width=400&query=vietnam+license+plate",
    entryTime: entryDate.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    duration: "3 giờ 15 phút",
    location: "A-12",
    currentFee: "45.000 đ",
    hasMonthlyPass: true,
    monthlyPassExpiry: expiryDate.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}
