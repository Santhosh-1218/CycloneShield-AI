import React from 'react';
import { Download } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ReportsPage: React.FC = () => {
  const { location } = useLocation();

  const reports = [
    {
      id: 'REP-2026-0925-01',
      title: `District Disaster Vulnerability Briefing - ${location.city} Coastal Zone`,
      date: 'Today',
      riskScore: '82 / 100 (HIGH)',
      type: 'Automated AI Executive Summary',
      status: 'Generated'
    },
    {
      id: 'REP-2026-0924-02',
      title: `Infrastructure Exposure Assessment - ${location.district || location.city} Hospitals`,
      date: 'Yesterday',
      riskScore: '74 / 100 (MODERATE)',
      type: 'OSM Asset Exposure Report',
      status: 'Generated'
    }
  ];

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Disaster Risk Dossiers & Reports
            </h1>
            <Badge status="FORECAST">REPORTS</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Exportable executive summaries and infrastructure vulnerability assessments
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} hoverEffect padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#16A34A] font-bold">{r.id} • {r.date}</span>
                <h3 className="font-bold text-base text-[#111111]">{r.title}</h3>
                <p className="text-xs text-[#666666]">{r.type} • Risk Index: <span className="text-[#DC2626] font-bold">{r.riskScore}</span></p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Exporting report ${r.id}...`)}
                icon={<Download className="w-4 h-4 text-[#16A34A]" />}
              >
                Export PDF / JSON
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
