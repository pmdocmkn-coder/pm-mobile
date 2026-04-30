import { api } from "./api";

export interface NecTower {
  id: number;
  name: string;
  linkCount?: number;
}

export interface NecLink {
  id: number;
  linkName: string;
  towerId: number;
  towerName?: string;
}

export interface NecMonthlyData {
  linkId: number;
  linkName: string;
  towerName: string;
  values: Record<string, number | null>;
  average?: number;
}

export interface NecYearlyPivotData {
  linkId: number;
  linkName: string;
  towerName: string;
  monthlyAverages: Record<string, number | null>;
  yearlyAverage?: number;
}

export const necSignalService = {
  getTowers: async (): Promise<NecTower[]> => {
    const response = await api.get("/api/nec-signal/towers");
    return response.data.data;
  },

  getLinks: async (): Promise<NecLink[]> => {
    const response = await api.get("/api/nec-signal/links");
    return response.data.data;
  },

  getMonthly: async (year: number, month: number): Promise<NecMonthlyData[]> => {
    const response = await api.get("/api/nec-signal/monthly", {
      params: { year, month },
    });
    return response.data.data;
  },

  getYearlyPivot: async (year: number, tower?: string): Promise<NecYearlyPivotData[]> => {
    const response = await api.get("/api/nec-signal/yearly-pivot", {
      params: { year, tower },
    });
    return response.data.data;
  },
};
