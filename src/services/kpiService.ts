import { api } from "./api";

export interface KpiDocument {
  kpiDocumentId: number;
  documentName: string;
  documentType: string;
  towerName?: string;
  areaGroup?: string;
  periodMonth: string;
  status: string;
  signedDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface KpiQueryParams {
  periodMonth?: string;
  areaGroup?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface KpiListResponse {
  data: KpiDocument[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

export const kpiService = {
  getAll: async (params?: KpiQueryParams): Promise<KpiListResponse> => {
    const response = await api.get("/api/kpi-documents", { params });
    return response.data;
  },
};
