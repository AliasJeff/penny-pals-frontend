import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button, Toast } from '@nutui/nutui-react-taro';
import { userService } from '../../services';
import './index.less';

const Login = () => {
  const [loading, setLoading] = useState(false);
  
  // Handle WeChat login
  const handleWeChatLogin = async () => {
    setLoading(true);
    try {
      // Get WeChat login code
      const { code } = await Taro.login();
      
      if (!code) {
        Taro.showToast({
          title: '微信登录失败，请重试',
          icon: 'none'
        });
        return;
      }
      
      // Login with WeChat code
      const userData = await userService.loginWithWeChat(code);

      // Save token
      if (userData && userData.token) {
        Taro.setStorageSync('token', userData.token);
        
        // Navigate to home page
        Taro.reLaunch({
          url: '/pages/home/index'
        });
      } else {
        throw new Error('登录失败，请重试');
      }
    } catch (error) {
      console.error('Login error:', error);
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="login-page">
      <View className="login-content">
        <View className="login-logo">
          {/* App Logo */}
          <View className="login-logo__icon">记</View>
          <Text className="login-logo__text">记账小星球</Text>
        </View>
        
        <View className="login-slogan">
          <Text className="login-slogan__text">轻松记账，智慧生活</Text>
          <Text className="login-slogan__subtext">多人协作记账，让记账更简单</Text>
        </View>
        
        <View className="login-buttons">
          <Button 
            type="primary" 
            block
            loading={loading}
            className="login-buttons__wechat"
            onClick={handleWeChatLogin}
          >
            微信一键登录
          </Button>
        </View>
        
        <View className="login-agreement">
          <Text className="login-agreement__text">
            登录即表示您已同意
            <Text className="login-agreement__link">《用户协议》</Text>
            和
            <Text className="login-agreement__link">《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login; 