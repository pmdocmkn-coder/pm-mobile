import { api } from "./api";

export interface SwrSite {
  id: number;
  name: string;
  channelCount?: number;
}

export interface SwrChannel {
  id: number;
  channelName: string;
  siteId: number;
  siteName?: string;
}

export interface SwrYearlyPivotData {
  channelId: number;
  channelName: string;
  siteName: string;
  monthlyValues: Record<string, number | null>;
  yearlyAverage?: number;
}

export const swrService = {
  getSites: async (): Promise<SwrSite[]> => {
    const response = await api.get("/api/swr-signal/sites");
    return response.data.data;
  },

  getChannels: async (): Promise<SwrChannel[]> => {
    const response = await api.get("/api/swr-signal/channels");
    return response.data.data;
  },

  getMonthly: async (year: number, month: number) => {
    const response = await api.get("/api/swr-signal/monthly", {
      params: { year, month },
    });
    return response.data.data;
  },

  getYearlyPivot: async (year: number, site?: string): Promise<SwrYearlyPivotData[]> => {
    const response = await api.get("/api/swr-signal/yearly-pivot", {
      params: { year, site },
    });
    return response.data.data;
  },
};
