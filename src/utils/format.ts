/*
* 通用格式化类
* */
/*
* 把后端返回的人均价格转成用户可读的文案
* */
export const renderPriceText = ( price: number | null ) => {
  if ( price === null ) return '暂无报价'
  if ( price === 0 ) return '免费'
  return `¥${ price }`
}
