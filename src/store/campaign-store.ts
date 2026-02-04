import { create } from 'zustand';
import type { Campaign, NewCampaign } from '../types/models';
import * as campaignRepo from '../services/storage/campaign-repo';

interface CampaignStore {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadCampaigns: () => Promise<void>;
  createCampaign: (data: NewCampaign) => Promise<Campaign>;
  setActiveCampaign: (id: string | null) => void;
  deleteCampaign: (id: string) => Promise<void>;
  getActiveCampaign: () => Campaign | null;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  activeCampaignId: null,
  loading: false,
  error: null,

  loadCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const campaigns = await campaignRepo.getAllCampaigns();
      set({ campaigns, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  createCampaign: async (data: NewCampaign) => {
    set({ loading: true, error: null });
    try {
      const campaign = await campaignRepo.createCampaign(data);
      set(state => ({
        campaigns: [campaign, ...state.campaigns],
        activeCampaignId: campaign.id,
        loading: false,
      }));
      return campaign;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setActiveCampaign: (id: string | null) => {
    set({ activeCampaignId: id });
  },

  deleteCampaign: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await campaignRepo.deleteCampaign(id);
      set(state => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
        activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getActiveCampaign: () => {
    const { campaigns, activeCampaignId } = get();
    return campaigns.find(c => c.id === activeCampaignId) || null;
  },
}));
