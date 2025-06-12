import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Empty, Dialog, Skeleton, Swiper } from '@nutui/nutui-react-taro';
import { Plus } from '@nutui/icons-react-taro';
import { ledgerService } from '../../services';
import LedgerCard from '../../components/LedgerCard';
import FloatingButton from '../../components/FloatingButton';
import './index.less';

const Ledgers = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ledgers when page shows
  useDidShow(() => {
    fetchLedgers();
  });

  // Fetch user's ledgers
  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const data = await ledgerService.getMyLedgers();
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      Taro.showToast({
        title: '加载账本失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle create new ledger
  const handleCreateLedger = () => {
    Taro.navigateTo({ url: '/pages/ledgers/create/index' });
  };

  // Open ledger detail
  const handleOpenLedger = (ledger) => {
    Taro.navigateTo({
      url: `/pages/ledgers/detail/index?id=${ledger.id}`
    });
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View className="ledgers-skeleton">
      <Skeleton rows={1} title animated />
      <Skeleton rows={8} animated />
    </View>
  );

  return (
    <View className="ledgers-page">
      <View className="ledgers-header">
        <Text className="ledgers-header__title">我的账本</Text>
      </View>
      
      {loading ? (
        renderSkeleton()
      ) : (
        <View className="ledgers-content">
          {ledgers.length > 0 ? (
            <View className="ledgers-list">
              {ledgers.map(ledger => (
                <LedgerCard 
                  key={ledger.id} 
                  ledger={ledger} 
                  onTap={handleOpenLedger}
                />
              ))}
            </View>
          ) : (
            <View className="ledgers-empty">
              <Empty 
                description="暂无账本" 
                imageSize={100}
              />
              <View 
                className="ledgers-empty__button"
                onClick={handleCreateLedger}
              >
                <Plus size={16} />
                <Text>创建账本</Text>
              </View>
            </View>
          )}
        </View>
      )}
      
      {/* Floating button to create new ledger */}
      <FloatingButton onClick={handleCreateLedger} />

    </View>
  );
};

export default Ledgers; 