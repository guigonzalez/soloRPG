import React from 'react';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/date';
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

      <button
        className="retro-button"
        onClick={handleDelete}
        style={{ fontSize: '12px', padding: '4px 8px' }}
      >
        Delete
      </button>
    </Card>
  );
}
