
export const convertToCartItems = (roomRequestList) => {
  // Kiểm tra đầu vào
  if (!roomRequestList || !Array.isArray(roomRequestList)) {
    return { cartItems: [], roomMapping: {} };
  }

  // Khởi tạo roomMapping và danh sách serviceIds
  const roomMapping = {};
  const serviceIds = new Set();

  // Thu thập tất cả serviceIds và xây dựng roomMapping
  roomRequestList.forEach((room) => {
    const roomId = room.roomId;
    roomMapping[roomId] = roomMapping[roomId] || [];
    roomMapping[roomId].push(room.uniqueId);

    // Thu thập serviceIds từ serviceList
    if (room.serviceList && Array.isArray(room.serviceList)) {
      room.serviceList.forEach((service) => {
        serviceIds.add(service.id);
      });
    }
  });

  // Tạo serviceMap cho tất cả serviceIds
  const serviceMap = {};
  serviceIds.forEach((serviceId) => {
    serviceMap[serviceId] = roomRequestList.map((room) => {
      // Tìm dịch vụ tương ứng trong serviceList của phòng
      const service = room.serviceList?.find((s) => s.id === serviceId);
      return {
        roomId: room.roomId,
        quantity: service ? service.quantity || 0 : 0, // Nếu không có dịch vụ hoặc quantity undefined, dùng 0
        time: service ? service.time || "" : "",
        note: service ? service.note || "" : "",
      };
    });
  });

  // Chuyển serviceMap thành cartItems
  const cartItems = Array.from(serviceIds).map((serviceId) => ({
    serviceId: parseInt(serviceId),
    roomBookingRequestList: serviceMap[serviceId],
  }));

  return { cartItems, roomMapping };
};
