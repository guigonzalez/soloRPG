import React from 'react';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/date';
import { exportAndDownloadCampaign } from '../../services/export/campaign-exporter';
import { t } from '../../services/i18n/use-i18n';
import type { Campaign } from '../../types/models';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onSelect, onDelete }: CampaignCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('campaignCard.deleteConfirm', { title: campaign.title }))) {
      onDelete(campaign);
    }
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await exportAndDownloadCampaign(campaign.id, campaign.title);
      alert(t('settings.exportSuccess'));
    } catch (error) {
      console.error('Export failed:', error);
      alert(`${t('common.error')}: ${error instanceof Error ? error.message : t('errors.unknown')}`);
    }
  };

  return (
    <Card className="campaign-card" onClick={() => onSelect(campaign)}>
      <div className="campaign-card-header">
        <div className="campaign-card-title">{campaign.title}</div>
        <div className="campaign-card-date">{formatDate(campaign.updatedAt)}</div>
      </div>

      <div className="campaign-card-meta">
        <span className="campaign-card-label">{t('campaignCard.theme')}:</span> {campaign.theme}
      </div>

      <div className="campaign-card-meta campaign-card-tone">
        <span className="campaign-card-label">{t('campaignCard.tone')}:</span> {campaign.tone}
      </div>

      <div className="campaign-card-actions">
        <button className="retro-button campaign-card-btn" onClick={handleExport}>
          📤 {t('settings.exportCampaign')}
        </button>
        <button className="retro-button campaign-card-btn campaign-card-btn-danger" onClick={handleDelete}>
          {t('common.delete')}
        </button>
      </div>
    </Card>
  );
}
