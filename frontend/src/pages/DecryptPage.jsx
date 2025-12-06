import { useState } from 'react';
import { Unlock, Download, CheckCircle, AlertCircle, FileText, Image, Key } from 'lucide-react';
import { api } from '../services/api';
import { BackgroundBeams } from '../components/ui/background-beams';
import { FileUpload } from '../components/ui/file-upload';

export default function DecryptPage() {
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [decryptedBlob, setDecryptedBlob] = useState(null);

  const handleFileSelected = (files) => {
    if (files && files[0]) {
      const selected = files[0];
      setFile(selected);
      setError(null);
    }
  };

  const handleDecrypt = async () => {
    if (!fileUrl || !file) {
      setError('Please provide both File URL and Key Image File');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const blob = await api.decryptFile(fileUrl, file);
      setDecryptedBlob(blob);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadDecryptedFile = () => {
    if (!decryptedBlob) return;

    const url = URL.createObjectURL(decryptedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decrypted-file`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFileUrl('');
    setFile(null);
    setSuccess(false);
    setError(null);
    setDecryptedBlob(null);
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
              <div className="absolute inset-0 bg-purple-500/30 blur-3xl" />
              <Unlock className="w-16 h-16 text-purple-400 relative" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Decrypt File
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Retrieve your original file using the File ID and Key Image
          </p>
        </div>

        {!success ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                File URL
              </h3>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Enter your encrypted file URL"
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors duration-300"
              />
              <p className="text-gray-500 text-sm mt-2">
                The URL to your encrypted file
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-400" />
                Key File
              </h3>
              <div className="relative rounded-xl p-2 border border-gray-800 bg-black/20">
                <FileUpload onChange={handleFileSelected} />
                <p className="text-gray-500 text-sm mt-2 text-center">Upload your key file</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleDecrypt}
              disabled={loading || !fileUrl || !file}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="w-6 h-6" />
                  Decrypt File
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-green-500/10 to-purple-500/10 border border-green-500/50 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Decryption Successful!</h2>
              <p className="text-gray-400">Your original file has been recovered</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Decrypted File Ready
              </h3>
              <button
                onClick={downloadDecryptedFile}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
              >
                <Download className="w-6 h-6" />
                Download Original File
              </button>
              <p className="text-gray-500 text-sm text-center">
                File size: {(decryptedBlob.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-300"
            >
              Decrypt Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
