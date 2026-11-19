import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Lead } from '../types';

interface LeadsPageProps {
  leads: Lead[];
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ leads }) => {
  const handleExportCSV = () => {
    const headers = ['ID', 'Username', 'Name', 'Email', 'Tag', 'SourceTrigger', 'Status', 'InteractionTime'];
    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.username}"`,
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.tag || ''}"`,
      `"${(l.sourceTrigger || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.interactionTime}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'instaflow_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'instaflow_leads.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Audience & Captured Leads CRM</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Contacts acquired through keyword-triggered comments, DMs, and story mentions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-[#1f2937] hover:bg-[#2d3748] text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#374151] transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-[#1f2937] hover:bg-[#2d3748] text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#374151] transition"
          >
            <FileText className="w-3.5 h-3.5 text-pink-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f2937]/50 border-b border-[#2d3748] text-zinc-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4">Source Trigger</th>
                <th className="p-4">Funnel Tag</th>
                <th className="p-4">Status</th>
                <th className="p-4">Interaction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={l.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full bg-zinc-800 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white">@{l.username}</div>
                        <div className="text-[11px] text-zinc-400">{l.email || 'Email not linked'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sky-400 font-medium">{l.sourceTrigger}</td>
                  <td className="p-4">
                    <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {l.tag}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        l.status === 'delivered'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 text-[11px]">
                    {new Date(l.interactionTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
