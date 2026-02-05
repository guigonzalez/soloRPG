import { useEffect, useState, useRef } from 'react';
import { useCampaignStore } from '../../store/campaign-store';
import { CampaignCard } from './CampaignCard';
import { CampaignCreate } from './CampaignCreate';
import { PresetCampaigns } from './PresetCampaigns';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { SettingsModal } from '../common/SettingsModal';
import { importCampaignFromFile } from '../../services/export/campaign-importer';
import { t } from '../../services/i18n/use-i18n';
import type { Campaign, NewCampaign } from '../../types/models';

interface CampaignListProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignList({ onSelectCampaign }: CampaignListProps) {
  const { campaigns, loading, loadCampaigns, createCampaign, deleteCampaign } = useCampaignStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedCampaign = await importCampaignFromFile(file);
      await loadCampaigns(); // Refresh campaign list
      alert(t('settings.importSuccess'));
      onSelectCampaign(importedCampaign);
    } catch (error) {
      console.error('Import failed:', error);
      alert(`${t('settings.importFailed')}: ${error instanceof Error ? error.message : t('errors.unknown')}`);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (showPresets) {
    return (
      <PresetCampaigns
        onSelectCampaign={onSelectCampaign}
        onBack={() => setShowPresets(false)}
      />
    );
  }

  if (showCreate) {
    return (
      <CampaignCreate
        onCreateCampaign={handleCreateCampaign}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div className="campaign-list-page">
      <div className="retro-container" style={{ flexShrink: 0 }}>
        <div className="app-header">
          <h1 className="app-title">{t('campaignList.title')}</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button onClick={() => setShowCreate(true)}>
              {t('campaignList.newCampaign')}
            </Button>
            <Button onClick={() => setShowPresets(true)}>
              {t('campaignList.quickStart')}
            </Button>
            <Button onClick={handleImportClick}>
              {t('settings.importCampaign')}
            </Button>
            <Button onClick={() => setShowSettings(true)}>
              {t('common.settings')}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="campaign-list-scroll">
        <div className="retro-container">
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
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
