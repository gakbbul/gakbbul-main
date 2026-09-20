import React from 'react';
import { ExternalLink, Globe, Tag } from 'lucide-react';
import { Site } from '../types';

interface SiteCardProps {
  site: Site;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  const handleCardClick = () => {
    if (!site.url) return;
    const targetUrl = site.url.startsWith('http') ? site.url : `https://${site.url}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const isDev = site.subtitle ? site.subtitle.includes('개발중') : false;

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between p-5 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden min-h-[180px]"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 ${isDev ? 'bg-red-500/5 group-hover:bg-red-500/15' : 'bg-blue-500/5 group-hover:bg-blue-500/15'}`} />

      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Header row: site url & tag & external link icon */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center space-x-2 text-slate-400 overflow-hidden">
              <Globe size={14} className={isDev ? 'text-red-400 flex-shrink-0' : 'text-blue-400 flex-shrink-0'} />
              <span className="text-xs font-medium tracking-wide text-slate-400 truncate max-w-[150px]">
                {site.url || site.name || 'LINK'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {site.subtitle && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border max-w-[150px] truncate ${
                  isDev 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <Tag size={10} />
                  <span className="truncate">{site.subtitle}</span>
                </span>
              )}
              <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug line-clamp-1 group-hover:text-blue-300 transition-colors">
            {site.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 font-normal">
            {site.description}
          </p>
        </div>

        {/* Footer info (if site url exists) */}
        {site.url && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
            <span className="truncate max-w-[200px]">{site.url}</span>
            <span className="text-blue-400/80 group-hover:text-blue-400 font-medium">방문하기 →</span>
          </div>
        )}
      </div>
    </div>
  );
};
