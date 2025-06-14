import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro, {
  useDidShow,
  useShareAppMessage,
  usePullDownRefresh,
} from "@tarojs/taro";
import { Empty, Dialog, Skeleton, Swiper } from "@nutui/nutui-react-taro";
import { Plus } from "@nutui/icons-react-taro";
import { ledgerService } from "../../services";
import LedgerCard from "../../components/LedgerCard";
import FloatingButton from "../../components/FloatingButton";
import JoinPopup from "../../components/JoinPopup";
import "./index.less";

const Ledgers = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ ledgerCount: 0, entryCount: 0 });
  const [showJoinPopup, setShowJoinPopup] = useState(false);

  // Fetch ledgers when page shows
  useDidShow(() => {
    fetchLedgers();
  });

  // Handle pull-down refresh
  usePullDownRefresh(() => {
    setRefreshing(true);
    fetchLedgers().finally(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    });
  });

  // Register share functionality
  useShareAppMessage(async () => {
    return {
      title: "邀请你使用记账小星球",
      path: "/pages/login/index",
    };
  });

  // Fetch user's ledgers
  const fetchLedgers = async () => {
    if (!refreshing) setLoading(true);
    try {
      const data = await ledgerService.getMyLedgersDetail();
      setLedgers(data || []);

      // Calculate total stats
      if (data && data.length > 0) {
        const totalEntries = data.reduce(
          (sum, ledger) => sum + (ledger.entries?.length || 0),
          0
        );

        setStats({
          ledgerCount: data.length,
          entryCount: totalEntries,
        });
      }
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      Taro.showToast({
        title: "加载账本失败，请重试",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle create new ledger
  const handleCreateLedger = () => {
    Taro.navigateTo({ url: "/pages/ledgers/create/index" });
  };

  // Handle join ledger
  const handleJoinLedger = () => {
    setShowJoinPopup(true);
  };

  // Handle invite popup close
  const handleJoinPopupClose = () => {
    setShowJoinPopup(false);
    fetchLedgers();
  };

  // Open ledger detail
  const handleOpenLedger = (ledger) => {
    Taro.navigateTo({
      url: `/pages/ledgers/detail/index?id=${ledger.id}`,
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
        <View className="ledgers-header__left">
          <Text className="ledgers-header__title">我的账本</Text>
          <View className="ledgers-header__stats">
            <Text className="ledgers-header__stats-text">
              {stats.ledgerCount}个账本 · {stats.entryCount}笔记录
            </Text>
          </View>
        </View>
        <View className="ledgers-header__right">
          <View className="button" onClick={handleCreateLedger}>
            <Plus size={16} />
            <Text>创建</Text>
          </View>
          <View className="button2" onClick={handleJoinLedger}>
            <Text>加入</Text>
          </View>
        </View>
      </View>

      {loading ? (
        renderSkeleton()
      ) : (
        <View className="ledgers-content">
          {ledgers.length > 0 ? (
            <View className="ledgers-list">
              {ledgers.map((ledger) => (
                <LedgerCard
                  key={ledger.id}
                  ledger={ledger}
                  onTap={handleOpenLedger}
                />
              ))}
            </View>
          ) : (
            <View className="ledgers-empty">
              <Empty description="暂无账本" imageSize={100} />
              <View className="ledgers-empty__actions">
                <View className="button" onClick={handleCreateLedger}>
                  <Plus size={16} />
                  <Text>创建账本</Text>
                </View>
                <View className="button2" onClick={handleJoinLedger}>
                  <Text>加入账本</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Floating button to create new ledger */}
      {/* <FloatingButton onClick={handleCreateLedger} /> */}

      {/* Join Popup for joining ledger by invite code */}
      <JoinPopup visible={showJoinPopup} onClose={handleJoinPopupClose} />
    </View>
  );
};

export default Ledgers;
