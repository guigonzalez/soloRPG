import { useEffect, useState, useRef } from 'react';
import { useCampaignStore } from '../../store/campaign-store';
import { CampaignCard } from './CampaignCard';
import { CampaignCreate } from './CampaignCreate';
import { PresetCampaigns } from './PresetCampaigns';
import { LandingHero } from './LandingHero';
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
      <div className="campaign-list-scroll">
        <div className="retro-container campaign-list-container">
          <LandingHero
            onQuickStart={() => setShowPresets(true)}
            onCreateCampaign={() => setShowCreate(true)}
            onImport={handleImportClick}
            onSettings={() => setShowSettings(true)}
            hasCampaigns={campaigns.length > 0}
          />

          {loading && campaigns.length === 0 ? (
            <Loading message={t('common.loading')} />
          ) : campaigns.length > 0 ? (
            <section className="campaign-list-section">
              <h2 className="campaign-list-section-title">
                {t('campaignList.selectCampaign')}
              </h2>
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
            </section>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
