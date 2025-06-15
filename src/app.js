import React, { useEffect } from 'react'
import { useDidShow, useDidHide, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro'
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

  useDidShow(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage"],
    });
  });

  // Register share functionality
  useShareAppMessage(async () => {
    return {
      title: '邀请你使用记账小星球',
      path: '/pages/home/index'
    };
  });

  // 实现下拉刷新
  usePullDownRefresh(() => {
    // 下拉刷新时重新加载数据
    refreshData()
      .then(() => {
        // 数据加载完成后停止下拉刷新动画
        Taro.stopPullDownRefresh();
      })
      .catch(error => {
        console.error('Refresh data error:', error);
        Taro.stopPullDownRefresh();
      });
  });

  // 刷新数据的函数
  const refreshData = async () => {
    try {
      const token = Taro.getStorageSync('token');
      if (token) {
        // 根据当前页面刷新相应的数据
        const currentPages = Taro.getCurrentPages();
        const currentPage = currentPages[currentPages.length - 1];
        
        if (currentPage && currentPage.onPullDownRefresh) {
          // 如果页面有自己的下拉刷新处理函数，则调用它
          await currentPage.onPullDownRefresh();
        }
        
        // 全局数据刷新逻辑可以放在这里
        console.log('Global data refreshed');
      }
    } catch (error) {
      console.error('Refresh data error:', error);
      throw error;
    }
  };

  // 检查登录状态
  const checkLoginStatus = () => {
    try {
      const token = Taro.getStorageSync('token');
      const currentUser = Taro.getStorageSync('currentUser');
      
      // 如果没有token，跳转到登录页
      if (!token || !currentUser) {
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
