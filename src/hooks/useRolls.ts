import { useState, useEffect } from 'react';
import * as rollRepo from '../services/storage/roll-repo';
import type { Roll } from '../types/models';

/**
 * Hook to load rolls for a campaign
 */
export function useRolls(campaignId: string | null) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setRolls([]);
      return;
    }

    const loadRolls = async () => {
      setLoading(true);
      try {
        const campaignRolls = await rollRepo.getRollsByCampaign(campaignId, 20);
        setRolls(campaignRolls);
      } catch (err) {
        console.error('Failed to load rolls:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRolls();
  }, [campaignId]);

  const addRoll = (roll: Roll) => {
    setRolls(prev => [...prev, roll]);
  };

  return { rolls, loading, addRoll };
}
