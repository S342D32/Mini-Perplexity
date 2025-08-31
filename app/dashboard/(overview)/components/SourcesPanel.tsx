import { XMarkIcon } from '@heroicons/react/24/outline';

interface Source {
  id: number;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  favicon_url: string;
  published_date: string | null;
}

interface SourcesPanelProps {
  sources: Source[];
  onClose: () => void;
}

export default function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recent';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Sources</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-3">
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl transition-all group"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={source.favicon_url} 
                  alt={source.domain}
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/default-favicon.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">{source.domain}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{formatDate(source.published_date)}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-3">
                    {source.snippet}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
