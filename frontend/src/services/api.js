export const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || 'http://localhost:8000') + '/api';

export const api = {
  async getGraphData() {
    const response = await fetch(`${API_BASE}/graph`);
    if (!response.ok) throw new Error('Failed to fetch graph data');
    const result = await response.json();
    
    // Filter out null entries and return top 5
    return result.data
      .filter(item => item.fileType !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  async encryptFile(file, expiryMinutes) {
    const formData = new FormData();
    formData.append('file', file);
    // include expiryMinutes selected from the dropdown so backend sees req.body.expiryMinutes
    if (expiryMinutes !== undefined && expiryMinutes !== null) {
      formData.append('expiryMinutes', String(expiryMinutes));
    }

    const response = await fetch(`${API_BASE}/encode`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Encryption failed');
    const data = await response.json();
    return {
      accessUrl: data.accessUrl,
      keyImageDataUrl: data.keyImageDataUrl,
      keyImageName: data.keyImageName,
    };
  },

  async decryptFile(fileUrl, keyFile) {
    const formData = new FormData();
    formData.append('fileUrl', fileUrl);
    formData.append('file', keyFile);

    const response = await fetch(`${API_BASE}/decode`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Decryption failed');
    return response.blob();
  },
};
