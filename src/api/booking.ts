import request from "./index";

// 预约时段（查询可预约时段接口）
export interface BookingSlotVO {
  id: number
  targetType: string
  targetId: number
  slotDate: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  remainingCount: number
  status: number // 1=可预约 0=已下架
}

// 我的预约订单（用户视角，不含 userId/username——那是管理员视角VO才有的字段）
export interface BookingOrderVO {
  id: number
  status: number // 0待确认 1已确认 2已取消 3已完成
  statusText: string
  targetType: string
  targetId: number
  targetName: string
  slotDate: string
  startTime: string
  endTime: string
  createTime: string
}

export interface PageResult<T> {
  records: T[],
  total: number
}

// 查询可预约时段（不分页，返回当前targetType+targetId下的所有时段）
export function listAvailableBookingSlots( targetType: string, targetId: number ): Promise<BookingSlotVO[]> {
  return request.get( '/booking-slots/available', { params: { targetType, targetId } } )
}

// 创建预约订单，只需要slotId——userId后端从登录态取，不用前端传
export function createBookingOrder( slotId: number ): Promise<number> {
  return request.post( '/booking-orders', { slotId } )
}

// 分页查询我的预约订单
export function getMyBookingOrders( pageNum: number, pageSize: number ): Promise<PageResult<BookingOrderVO>> {
  return request.get( '/booking-orders/my', { params: { pageNum, pageSize } } )
}

// 取消预约订单（用户只能取消自己的，后端已做权限校验）
export function cancelBookingOrder( id: number ): Promise<void> {
  return request.put( `/booking-orders/${ id }/cancel` )
}
