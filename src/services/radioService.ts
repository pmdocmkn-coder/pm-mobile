import { api } from "./api";

export interface RadioTrunking {
  radioTrunkingId: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
  issiNumber?: string;
  condition?: string;
  location?: string;
  user?: string;
  notes?: string;
}

export interface RadioConventional {
  radioConventionalId: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
  frequency?: string;
  condition?: string;
  location?: string;
  user?: string;
  notes?: string;
}

export interface RadioQueryParams {
  search?: string;
  condition?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface RadioListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

export const radioService = {
  getTrunking: async (params?: RadioQueryParams): Promise<RadioListResponse<RadioTrunking>> => {
    const response = await api.get("/api/radio-trunking", { params });
    return response.data;
  },

  getConventional: async (params?: RadioQueryParams): Promise<RadioListResponse<RadioConventional>> => {
    const response = await api.get("/api/radio-conventional", { params });
    return response.data;
  },
};
