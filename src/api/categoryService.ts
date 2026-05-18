import api from './axios';
import type { GenericResponse } from '@/auth/authService';

const BASE_URL = '/category';

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface UserCategory {
  userId: number;
  username: string;
  category: Category;
}

export interface UserCategoryList {
  userId: number;
  username: string;
  noOfItems: number;
  categories: Category[];
}

export interface CategoryDTO {
  name: string;
  description: string;
  imageUrl?: string;
  deleteImage?: boolean;
}

export const categoryService = {
  /**
   * Fetch all categories for the authenticated user
   */
  getCategories: async (): Promise<UserCategoryList> => {
    const res = await api.get<UserCategoryList>(`${BASE_URL}`);
    return res.data;
  },

  /**
   * Fetch a single category by ID
   */
  getCategoryById: async (id: number): Promise<UserCategory> => {
    const res = await api.get<UserCategory>(`${BASE_URL}/${id}`);
    return res.data;
  },

  /**
   * Create a new category with an optional image file or imageUrl string
   */
  createCategory: async (categoryData: CategoryDTO, imageFile?: File): Promise<UserCategory> => {
    const formData = new FormData();
    formData.append(
      'category',
      new Blob([JSON.stringify(categoryData)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await api.post<UserCategory>(`${BASE_URL}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Update an existing category using multipart/form-data
   */
  updateCategory: async (id: number, categoryData: CategoryDTO, imageFile?: File): Promise<UserCategory> => {
    const formData = new FormData();
    formData.append(
      'category',
      new Blob([JSON.stringify(categoryData)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const queryParams = categoryData.deleteImage ? '?deleteImage=true' : '';

    const res = await api.put<UserCategory>(`${BASE_URL}/${id}${queryParams}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Delete a category by ID
   */
  deleteCategory: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`${BASE_URL}/${id}`);
    return res.data;
  },
};
