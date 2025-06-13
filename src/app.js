import React, { useEffect } from 'react'
import { useDidShow, useDidHide, useShareAppMessage } from '@tarojs/taro'
import Taro from '@tarojs/taro'
// 导入 NutUI 样式
import '@nutui/nutui-react-taro/dist/style.css'
// 全局样式
import './app.less'

function App(props) {
  // 检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, [])
  
  // Register share functionality
  useShareAppMessage(async () => {
    return {
      title: '邀请你使用记账小星球',
      path: '/pages/home/index'
    };
  });

  // 检查登录状态
  const checkLoginStatus = () => {
    try {
      const token = Taro.getStorageSync('token');
      
      // 如果没有token，跳转到登录页
      if (!token) {
        const currentPath = Taro.getCurrentPages();
        
        // 如果当前不在登录页，则跳转到登录页
        if (currentPath.length === 0 || currentPath[0].route !== 'pages/login/index') {
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      }
    } catch (error) {
      console.error('Check login status error:', error);
    }
  };

  // 对应 onShow
  useDidShow(() => {
    // 每次页面显示时检查登录状态
    checkLoginStatus();
  })

  // 对应 onHide
  useDidHide(() => {})

  return props.children
}

export default App
