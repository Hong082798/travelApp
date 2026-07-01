import request from './index';
import type { PageResult } from './types';

// 玩乐分类
export interface EntertainmentCategory {
  id: number;
  name: string;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
}

// 玩乐项目（列表 / 详情）
export interface EntertainmentItem {
  id: number;
  categoryId: number;
  categoryName: string | null;
  name: string;
  description: string | null;
  coverImage: string | null;
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  avgPrice: number | null;
  openTime: string | null;
  phone: string | null;
  tags: string | null;
  score: number | null;
  sort: number;
  status: number;
  createTime: string;
}

export interface EntertainmentPageParams {
  pageNum: number;
  pageSize: number;
  categoryId?: number;
  keyword?: string;
  status?: number;
}

// 查询全部玩乐分类
export const getEntertainmentCategories = () =>
  request.get<any, EntertainmentCategory[]>('/entertainment-categories/list');

// 分页查询玩乐项目
export const getEntertainmentPage = (params: EntertainmentPageParams) =>
  request.post<any, PageResult<EntertainmentItem>>(
    '/entertainment-items/page',
    params,
  );

// 查询玩乐项目详情
export const getEntertainmentDetail = (id: number) =>
  request.get<any, EntertainmentItem>(`/entertainment-items/detail/${id}`);

// 收藏玩乐项目
export const favoriteEntertainment = (id: number) => {
  return request.post<any, null>(`/favorites/ENTERTAINMENT/${id}`);
};

// 取消收藏玩乐项目
export const unfavoriteEntertainment = (id: number) => {
  return request.delete<any, null>(`/favorites/ENTERTAINMENT/${id}`);
};

// 检查是否收藏（返回boolean）
export const checkEntertainmentFavorite = (id: number) => {
  return request.get<any, boolean>(`/favorites/check/ENTERTAINMENT/${id}`);
};
