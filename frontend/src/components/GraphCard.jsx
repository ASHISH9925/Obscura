import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';

export default function GraphCard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getGraphData();
        setData(result);
        setError(null);
      } catch {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxCount = data.length > 0 ? data[0].count : 1;
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const getFileTypeLabel = (mimeType) => {
    const mimeMap = {
      'text/plain': 'TXT',
      'image/gif': 'GIF',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'application/pdf': 'PDF',
      'application/zip': 'ZIP',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    };
    
    if (mimeMap[mimeType]) {
      return mimeMap[mimeType];
    }
    
    const parts = mimeType.split('/');
    return parts[parts.length - 1].toUpperCase().substring(0, 10);
  };

  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gradient-to-br from-gray-900/95 via-blue-950/95 to-gray-900/95 relative group/card border-white/[0.2] sm:w-[34rem] h-auto rounded-xl p-8 border backdrop-blur-sm min-h-[32rem] pb-16">
        <CardItem
          translateZ="50"
          className="text-2xl font-bold text-white mb-6"
        >
          File Encryption Analytics
        </CardItem>

        <CardItem translateZ="60" className="w-full">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-800 rounded mb-2" />
                  <div className="h-8 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : data.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No data available yet</div>
          ) : (
            <div className="space-y-5">
              {data.map((item, index) => {
                const percentage = (item.count / maxCount) * 100;
                return (
                  <CardItem
                    key={item.fileType}
                    translateZ={70 + index * 5}
                    className="w-full"
                  >
                    <div className="group/item transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold text-lg">#{index + 1}</span>
                          <span className="text-gray-300 font-medium">
                            {getFileTypeLabel(item.fileType)}
                          </span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                          {item.count}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-cyan-500/50"
                          style={{ width: `${percentage}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full blur-sm transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardItem>
                );
              })}
            </div>
          )}
        </CardItem>

        <CardItem translateZ="40" className="w-full mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Encryptions</span>
            <span className="text-white font-bold text-lg">
              {totalCount}
            </span>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
