import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  FileCheck, 
  Sparkles, 
  ClipboardList,
  Check
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLocation } from '../context/LocationContext';

export const AlertsPage: React.FC = () => {
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'alerts' | 'action-center' | 'ai-advisory'>('alerts');
  const [approvedAdvisory, setApprovedAdvisory] = useState<boolean>(false);
  const [verificationSteps, setVerificationSteps] = useState([
    { id: 1, label: 'Cross-check Open-Meteo spatial radar with IMD Doppler imagery', completed: true },
    { id: 2, label: 'Verify low-lying coastal elevation via NASADEM topographic grid', completed: true },
    { id: 3, label: 'Confirm emergency shelter and medical center accessibility in OSM GIS', completed: false },
    { id: 4, label: 'Issue draft warning notice to district disaster response authorities', completed: false }
  ]);

  const toggleVerification = (id: number) => {
    setVerificationSteps(prev =>
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  const alerts = [
    {
      id: 'alt-1',
      typeBadge: 'OFFICIAL WARNING',
      severity: 'DANGER',
      title: 'Heavy Rainfall & Coastal Waterlogging Warning',
      region: `${location.city || 'Kakinada'}, ${location.state || 'Andhra Pradesh'}`,
      validity: 'Valid: Today 18:00 → Tomorrow 06:00',
      details: 'Expected 24h accumulated rainfall: 64–115 mm. Local low-lying flooding and reduced road visibility expected.',
      impacts: ['Waterlogging in coastal lowlands', 'Reduced visibility on arterial roads', 'Local stormwater drain overflow']
    },
    {
      id: 'alt-2',
      typeBadge: 'FORECAST',
      severity: 'WARNING',
      title: 'High Sustained Coastal Wind Velocity',
      region: `${location.city || 'Kakinada'} Coastal Zone`,
      validity: 'Valid: Next 12–24 Hours',
      details: 'Wind speeds projected to reach 45–60 km/h with gusts up to 75 km/h along shoreline sectors.',
      impacts: ['Hazard to small marine vessels', 'Minor damage to loose structures', 'Elevated coastal chop']
    },
    {
      id: 'alt-3',
      typeBadge: 'MODELLED RISK',
      severity: 'INFO',
      title: 'Infrastructure Inundation Vulnerability Index',
      region: `${location.district || location.city || 'East Coast'} Lowland Zones`,
      validity: 'Modelled by Geographic Risk Engine',
      details: 'Hospitals and emergency shelter access roads evaluated at elevated vulnerability due to coastal proximity.',
      impacts: ['Secondary access routes may experience shallow inundation', 'Medical centers advised to test backup power generators']
    }
  ];

  return (
    <div className="space-y-6 text-[#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Alerts & Action Center
            </h1>
            <Badge status="LIVE">OPERATIONAL</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Official bulletins, modelled risks, and human-in-the-loop action workflows
          </p>
        </div>

        {/* Action Center Tabs */}
        <div className="flex items-center space-x-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E5E5E5] text-xs">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-white text-[#16A34A] font-bold shadow-xs border border-[#E5E5E5]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Active Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('action-center')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'action-center'
                ? 'bg-white text-[#16A34A] font-bold shadow-xs border border-[#E5E5E5]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Action Workflow
          </button>
          <button
            onClick={() => setActiveTab('ai-advisory')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'ai-advisory'
                ? 'bg-white text-[#16A34A] font-bold shadow-xs border border-[#E5E5E5]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            AI Advisory Review
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.map((item) => (
            <Card key={item.id} hoverEffect padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.severity === 'DANGER' 
                      ? 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626]' 
                      : 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        item.typeBadge === 'OFFICIAL WARNING' ? 'bg-[#DC2626] text-white' :
                        item.typeBadge === 'FORECAST' ? 'bg-[#0284C7] text-white' :
                        'bg-[#16A34A] text-white'
                      }`}>
                        {item.typeBadge}
                      </span>
                      <h3 className="font-bold text-base text-[#111111]">{item.title}</h3>
                    </div>
                    <p className="text-xs text-[#666666] leading-relaxed">{item.details}</p>
                    <div className="text-xs text-[#888888] font-medium">
                      Region: <strong>{item.region}</strong> • {item.validity}
                    </div>

                    {/* Potential Impacts */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#111111] block mb-1">Potential Impacts:</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#666666]">
                        {item.impacts.map((imp, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('action-center')}
                  >
                    Take Action
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('ai-advisory')}
                  >
                    Draft Advisory
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: ACTION WORKFLOW */}
      {activeTab === 'action-center' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Action Steps Checklist (7 cols) */}
          <Card className="lg:col-span-7" padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#16A34A]" />
                <h2 className="text-base font-bold text-[#111111]">Recommended Verification & Action Plan</h2>
              </div>
              <Badge status="MODELLED">HUMAN-IN-THE-LOOP</Badge>
            </div>

            <p className="text-xs text-[#666666] mb-4 leading-relaxed">
              Standard operating procedure before escalating risk advisories. Complete verification steps before approving official dissemination.
            </p>

            <div className="space-y-3">
              {verificationSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => toggleVerification(step.id)}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-colors ${
                    step.completed
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#111111]'
                      : 'bg-white border-[#E5E5E5] text-[#666666] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                    step.completed ? 'bg-[#16A34A] border-[#15803D] text-white' : 'border-[#CCCCCC] bg-white'
                  }`}>
                    {step.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="text-xs font-medium leading-relaxed">
                    <span>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex justify-between items-center">
              <span className="text-xs text-[#666666]">
                {verificationSteps.filter(s => s.completed).length} of {verificationSteps.length} verified
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('ai-advisory')}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Proceed to Advisory Draft
              </Button>
            </div>
          </Card>

          {/* Incident Resource Readiness (5 cols) */}
          <Card className="lg:col-span-5" padding="lg">
            <h2 className="text-base font-bold text-[#111111] mb-3 pb-2 border-b border-[#E5E5E5]">
              Resource Readiness & Shelters
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl flex justify-between items-center">
                <div>
                  <strong className="text-[#111111] block">Cyclone Shelters (OSM)</strong>
                  <span className="text-[#666666]">Designated community capacity</span>
                </div>
                <span className="text-sm font-bold text-[#16A34A]">4 Ready</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl flex justify-between items-center">
                <div>
                  <strong className="text-[#111111] block">Medical Emergency Units</strong>
                  <span className="text-[#666666]">Govt General Hospital & Clinics</span>
                </div>
                <span className="text-sm font-bold text-[#16A34A]">3 On Alert</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl flex justify-between items-center">
                <div>
                  <strong className="text-[#111111] block">Evacuation Corridors</strong>
                  <span className="text-[#666666]">State Highway & Coastal Access</span>
                </div>
                <span className="text-sm font-bold text-[#EAB308]">Monitored</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: AI ADVISORY DRAFT & HUMAN APPROVAL */}
      {activeTab === 'ai-advisory' && (
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#16A34A]" />
                <h2 className="text-base font-bold text-[#111111]">AI-Generated Advisory Draft</h2>
                <Badge status="WARNING">PENDING HUMAN REVIEW</Badge>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                DISCLAIMER: AI-generated advisory for operational review. Not an official government directive until approved.
              </p>
            </div>

            {approvedAdvisory ? (
              <Badge status="SUCCESS">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                OFFICIALLY APPROVED
              </Badge>
            ) : null}
          </div>

          <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-4 rounded-xl text-xs text-[#111111] space-y-3 font-mono leading-relaxed whitespace-pre-wrap">
            {`CYCLONESHIELD AI OPERATIONAL WEATHER ADVISORY\nTarget Region: ${location.city || 'Kakinada'}, ${location.state || 'Andhra Pradesh'}\nTimestamp: ${new Date().toLocaleString()}\n\n1. SITUATION SUMMARY:\nAtmospheric pressure observations and Open-Meteo spatial forecast indicate moderate rainfall accumulation (64-115 mm) over the next 24 hours. Wind vectors remain stable below gale threshold.\n\n2. IDENTIFIED VULNERABILITIES:\n- Lowland drainage basins below 5m elevation have elevated waterlogging probability.\n- Evacuation shelter corridors remain open with normal traffic capacity.\n\n3. RECOMMENDED ACTIONS FOR DISTRICT CONTROLLERS:\n- Maintain active monitoring of coastal drainage channels.\n- Pre-position backup generators at primary health centers.\n- Advise local fishermen to heed coastal advisory bulletins.`}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#666666]">
              {approvedAdvisory 
                ? '✓ Advisory authorized by Operational Analyst on this workstation.'
                : '⚠ Review and verify facts before approving advisory release.'}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText("CycloneShield Advisory copied.");
                  alert("Advisory text copied to clipboard!");
                }}
              >
                Copy Text
              </Button>
              {!approvedAdvisory ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setApprovedAdvisory(true)}
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Approve & Issue Advisory
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setApprovedAdvisory(false)}
                >
                  Revoke Approval
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
