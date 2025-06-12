import Taro from '@tarojs/taro';

const BASE_URL = 'http://192.168.31.33:8101';

/**
 * Request utility for handling API calls with standard error handling and authentication
 */
export default function request(options) {
  const { url, data, method = 'GET', header = {} } = options;

  // Get the token from storage (if exists)
  const token = Taro.getStorageSync('token');
  const headers = {
    'Content-Type': 'application/json',
    ...header,
  };
  
  // Add authentication if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      data,
      method,
      header: headers,
      success: (res) => {
        // Assuming API returns { code, data, message } structure
        const { code, data: responseData, message } = res.data;

        // Standard success code
        if (code === 0) {
          resolve(responseData);
        } else {
          // Handle different error codes
          switch (code) {
            case 401:
              // Unauthorized, clear token and redirect to login
              Taro.removeStorageSync('token');
              Taro.navigateTo({ url: '/pages/login/index' });
              break;
            default:
              Taro.showToast({
                title: message || '请求失败',
                icon: 'none'
              });
          }
          reject(res.data);
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// Convenience methods for different HTTP methods
export const get = (url, data, options = {}) => {
  return request({
    url,
    data,
    method: 'GET',
    ...options
  });
};

export const post = (url, data, options = {}) => {
  return request({
    url,
    data,
    method: 'POST',
    ...options
  });
}; 