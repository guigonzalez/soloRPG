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
    if (confirm(`Delete campaign "${campaign.title}"? This cannot be undone.`)) {
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
      alert(`${t('common.error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="campaign-card" onClick={() => onSelect(campaign)}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '4px',
          color: 'var(--color-accent)'
        }}>
          {campaign.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {formatDate(campaign.updatedAt)}
        </div>
      </div>

      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
        <strong>Theme:</strong> {campaign.theme}
      </div>

      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
        <strong>Tone:</strong> {campaign.tone}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="retro-button"
          onClick={handleExport}
          style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
        >
          {t('settings.exportCampaign')}
        </button>
        <button
          className="retro-button"
          onClick={handleDelete}
          style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
