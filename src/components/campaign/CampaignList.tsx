import { useEffect, useState } from 'react';
import { useCampaignStore } from '../../store/campaign-store';
import { CampaignCard } from './CampaignCard';
import { CampaignCreate } from './CampaignCreate';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { SettingsModal } from '../common/SettingsModal';
import { t } from '../../services/i18n/use-i18n';
import type { Campaign, NewCampaign } from '../../types/models';

interface CampaignListProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignList({ onSelectCampaign }: CampaignListProps) {
  const { campaigns, loading, loadCampaigns, createCampaign, deleteCampaign } = useCampaignStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleCreateCampaign = async (data: NewCampaign) => {
    const campaign = await createCampaign(data);
    setShowCreate(false);
    onSelectCampaign(campaign);
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    await deleteCampaign(campaign.id);
  };

  if (showCreate) {
    return (
      <CampaignCreate
        onCreateCampaign={handleCreateCampaign}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div className="retro-container">
      <div className="app-header">
        <h1 className="app-title">{t('campaignList.title')}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => setShowCreate(true)}>
            {t('campaignList.newCampaign')}
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            ⚙ {t('common.settings')}
          </Button>
        </div>
      </div>

      {loading && campaigns.length === 0 ? (
        <Loading message={t('common.loading')} />
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
            {t('campaignList.noCampaigns')}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            {t('campaignList.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="campaign-list">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectCampaign}
              onDelete={handleDeleteCampaign}
            />
          ))}
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
