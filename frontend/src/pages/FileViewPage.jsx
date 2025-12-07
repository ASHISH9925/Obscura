import { useState, useEffect } from 'react';
import { Eye, Lock, AlertCircle, Copy } from 'lucide-react';
import { API_BASE } from '../services/api';
import { BackgroundBeams } from '../components/ui/background-beams';
import { useParams } from 'react-router-dom';

export default function FileViewPage({ fileId: fileIdProp }) {
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const fileId = fileIdProp || params.fileId;

  useEffect(() => {
    const fetchFile = async () => {
        try {
          setLoading(true);
    // Request the file from the centralized backend base URL so dev server
    // doesn't return the frontend HTML.
    const response = await fetch(`${API_BASE}/file/${fileId}`);
        if (!response.ok) throw new Error('Failed to fetch file');
        const content = await response.text();
        setFileContent(content);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  const copyFileContent = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0">
        <BackgroundBeams className="opacity-40" />
      </div>
      <div className="max-w-4xl mx-auto px-6 relative z-20">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl" />
              <Eye className="w-16 h-16 text-cyan-400 relative" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Encrypted File Viewer
            </span>
          </h1>
        </div>

        {loading ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 mt-4">Loading encrypted file... (this is binary-encoded encrypted data and may take a few seconds to stream and render)</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Error Loading File</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">About This File</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This is your encrypted file stored securely on our servers. As you can see, the content is completely encrypted and unreadable without the corresponding key image. The encryption key is embedded invisibly in your key image using steganography - making it impossible to decrypt this file without it.
                  </p>
                </div>
              </div>
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3 text-sm text-cyan-300 font-mono">
                <p>File ID: <span className="text-cyan-400">{fileId}</span></p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Encrypted Content</h3>
                <button
                  onClick={copyFileContent}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-800 hover:bg-cyan-600 text-gray-300 hover:text-white'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-black/50 border border-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="font-mono text-sm text-gray-400 break-all whitespace-pre-wrap">
                  {fileContent}
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">
                💡 To decrypt this file, use the Decrypt page with this File ID and your key image
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm text-center font-medium">
                ⚠️ This encrypted content is secure. Only the holder of the matching key image can decrypt it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
