import { useState } from 'react';
import { Lock, Download, CheckCircle, AlertCircle, FileText, Image, Shield } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import { api } from '../services/api';
import { BackgroundBeams } from '../components/ui/background-beams';
import { FileUpload } from '../components/ui/file-upload';
import { useNavigate } from 'react-router-dom';

export default function EncryptPage() {
  const [file, setFile] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState('1440');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFilesSelected = (files) => {
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleEncrypt = async () => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.encryptFile(file, expiryMinutes);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadKeyImage = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.keyImageDataUrl;
    link.download = result.keyImageName;
    link.click();
  };

  const copyAccessUrl = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.accessUrl);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 relative overflow-hidden">
      <div className="absolute inset-0">
        <BackgroundBeams className="opacity-60" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl" />
              <Lock className="w-16 h-16 text-cyan-400 relative" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Encrypt File
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Upload your file and receive a key-image for decryption
          </p>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="relative rounded-2xl p-4 transition-all duration-300 border border-gray-800 bg-gradient-to-br from-gray-900 to-black">
              <FileUpload onChange={handleFilesSelected} />
              <p className="text-gray-500 text-sm mt-2 text-center">Maximum file size: 15MB For optimal performance, smaller files are recommended</p>
            </div>

            {file && (
              <div className="space-y-6 animate-in">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="bg-cyan-500/20 p-3 rounded-lg flex-shrink-0">
                      <FileText className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-base sm:text-lg truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <div className="sm:inline-block">
                        {/* lazy-load the Dropdown to keep markup simple */}
                        <Dropdown value={expiryMinutes} onChange={setExpiryMinutes} />
                      </div>
                    </div>
                    <button
                      onClick={handleEncrypt}
                      disabled={loading}
                      className="w-full sm:w-auto mt-2 sm:mt-0 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Encrypting...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Encrypt Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">What Happens Next</h3>
                      <ul className="text-gray-400 text-sm leading-relaxed space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>Your file is encrypted with a unique AES-256-GCM key</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>The key is hidden inside a random PNG image using steganography</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>You receive a File ID and the key-image for future decryption</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>Your encryption key is never stored on our servers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/50 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Encryption Successful!</h2>
              <p className="text-gray-400">Your file has been encrypted and secured</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-cyan-500/20 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Encrypted File URL</h3>
                  <p className="text-gray-400 text-sm">
                    Your encrypted file is securely stored. Click the link below to view it or copy it to share with others.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const fileId = result.accessUrl.split('/').pop();
                    if (fileId) {
                      navigate(`/file/${fileId}`);
                    }
                  }}
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg p-4 font-mono text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300 break-all text-left hover:underline"
                >
                  {result.accessUrl}
                </button>
                <button
                  onClick={copyAccessUrl}
                  className="px-6 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-300 font-medium transform hover:scale-105"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Image className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Key Image</h3>
                  <p className="text-gray-400 text-sm">
                    Your encryption key is invisibly embedded in this image using steganography. The key exists in the least significant bits of the pixel data - completely undetectable to the naked eye.
                  </p>
                </div>
              </div>
              <div className="bg-black/50 border border-gray-700 rounded-lg p-4 mb-4 hover:border-purple-500/50 transition-colors duration-300">
                <img
                  src={result.keyImageDataUrl}
                  alt="Key"
                  className="max-w-full h-auto rounded-lg mx-auto transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <button
                onClick={downloadKeyImage}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                Download Key Image
              </button>
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm text-center font-medium">
                  ⚠️ Keep this image safe! Without it, your encrypted file cannot be decrypted.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-300"
            >
              Encrypt Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
