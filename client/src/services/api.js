const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const analyzeText = async (text) => {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Analysis failed');
  }

  return data;
};

export const checkGrammar = async (text) => {
  const response = await fetch(`${API_URL}/grammar/check`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Grammar check failed');
  }

  return data;
};

export const correctGrammar = async (text) => {
  const response = await fetch(`${API_URL}/grammar/correct`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Auto correct failed');
  }

  return data;
};

export default { analyzeText, checkGrammar, correctGrammar };