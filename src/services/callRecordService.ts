import { api } from "./api";

export interface HourlySummary {
  hourGroup: number;
  timeRange: string;
  qty: number;
  teBusy: number;
  teBusyPercent: number;
  sysBusy: number;
  sysBusyPercent: number;
  others: number;
  othersPercent: number;
}

export interface DailySummary {
  date: string;
  hourlyData: HourlySummary[];
  totalQty: number;
  totalTEBusy: number;
  totalSysBusy: number;
  totalOthers: number;
  avgTEBusyPercent: number;
  avgSysBusyPercent: number;
  avgOthersPercent: number;
}

export interface CallRecord {
  callRecordId: number;
  callTime: string;
  callCloseReason: number;
  closeReasonDescription: string;
  hourGroup: number;
  createdAt: string;
}

export interface CallRecordsResponse {
  data: CallRecord[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export const callRecordService = {
  getDailySummary: async (date: string): Promise<DailySummary> => {
    const response = await api.get(`/api/call-records/summary/daily/${date}`);
    return response.data.data;
  },

  getCallRecords: async (params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<CallRecordsResponse> => {
    const response = await api.get("/api/call-records", { params });
    return response.data;
  },
};
