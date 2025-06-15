import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { Avatar, Empty, Skeleton, Tabs, Image } from "@nutui/nutui-react-taro";
import { userService, ledgerService, entryService } from "../../services";
import FloatingButton from "../../components/FloatingButton";
import LedgerCard from "../../components/LedgerCard";
import EntryModal from "../../components/EntryModal";
import LedgerEntries from "../../components/LedgerEntries";
import { getRelativeTimeDesc } from "../../utils/dateUtils";
import { getAvatarSrc } from "../../utils/avatarUtils";
import "./index.less";

const Home = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [ledgers, setLedgers] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [stats, setStats] = useState({ ledgerCount: 0, entryCount: 0 });

  const checkLoginStatus = () => {
    try {
      const token = Taro.getStorageSync("token");
      const currentUser = Taro.getStorageSync("currentUser");

      // 如果没有token，跳转到登录页
      if (!token || !currentUser) {
        const currentPath = Taro.getCurrentPages();

        // 如果当前不在登录页，则跳转到登录页
        if (
          currentPath.length === 0 ||
          currentPath[0].route !== "pages/login/index"
        ) {
          Taro.reLaunch({ url: "/pages/login/index" });
        }
      }
    } catch (error) {
      console.error("Check login status error:", error);
    }
  };

  // Fetch data when page shows
  useDidShow(() => {
    checkLoginStatus();
    fetchData();
  });

  // Handle pull-down refresh
  usePullDownRefresh(() => {
    setRefreshing(true);
    fetchData().finally(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    });
  });

  // Fetch all required data
  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    try {
      // Fetch user info
      const userData = await userService.getCurrentUser();
      Taro.setStorageSync("currentUser", userData);
      setUser(userData);

      // Fetch ledgers with detailed info
      const ledgersData = await ledgerService.getMyLedgersDetail();
      setLedgers(ledgersData || []);

      // Calculate ledger stats
      if (ledgersData && ledgersData.length > 0) {
        const totalEntries = ledgersData.reduce(
          (sum, ledger) => sum + (ledger.entries?.length || 0),
          0
        );

        setStats({
          ledgerCount: ledgersData.length,
          entryCount: totalEntries,
        });
      }

      // Fetch recent entries
      const entries = await entryService.listMyEntries({
        orderBy: "date",
        orderDirection: "desc",
        pageSize: 10,
      });
      setRecentEntries(entries || []);

      // Calculate balance (simplified for now)
      calculateBalance(entries);
    } catch (error) {
      console.error("Error fetching data:", error);
      Taro.showToast({
        title: "加载数据失败，请重试",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total balance from entries
  const calculateBalance = (entries) => {
    if (!entries || entries.length === 0) {
      setBalance(0);
      return;
    }

    const total = entries.reduce((acc, entry) => {
      if (entry.type === "income") {
        return acc + entry.amount;
      } else if (entry.type === "expense") {
        return acc - entry.amount;
      }
      return acc;
    }, 0);

    setBalance(total);
  };

  // Handle add entry button click
  const handleAddEntry = () => {
    setSelectedEntry(null);
    setShowEntryModal(true);
  };

  // Handle entry tap - open modal with the selected entry for editing
  const handleEntryTap = (entry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  // Handle entry added/updated/deleted
  const handleEntryChange = () => {
    fetchData();
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View className="home-skeleton">
      <Skeleton rows={1} title animated />
      <Skeleton rows={3} animated />
      <Skeleton rows={5} animated />
    </View>
  );

  // Main render
  return (
    <View className="home-page">
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* User info and balance */}
          <View className="home-header">
            <View className="home-header__user">
              {user?.avatar && getAvatarSrc(user.avatar) ? (
                <Avatar src={getAvatarSrc(user.avatar)} />
              ) : (
                <Avatar
                  style={{
                    backgroundClip: "#ff0f23",
                    color: "#5272f9",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  {user?.username?.substring(0, 1) || "..."}
                </Avatar>
              )}
              <Text className="home-header__username">
                {user?.username || "用户"}
              </Text>
            </View>
            <View className="home-header__balance">
              <View className="home-header__balance-info">
                <Text className="home-header__balance-label">当前余额</Text>
                <Text className="home-header__balance-amount">
                  ¥ {balance.toFixed(2)}
                </Text>
              </View>
              {/* <View className="home-header__stats">
                <Text className="home-header__stats-text">
                  {stats.ledgerCount}个账本 · {stats.entryCount}笔记录
                </Text>
              </View> */}
            </View>
          </View>

          {/* My Ledgers */}
          <View className="home-section">
            <View className="home-section__header">
              <Text className="home-section__title">我的账本</Text>
              <Text
                className="home-section__more"
                onClick={() => Taro.switchTab({ url: "/pages/ledgers/index" })}
              >
                查看全部
              </Text>
            </View>

            <ScrollView className="home-ledgers" scrollX showScrollbar={false}>
              {ledgers.length > 0 ? (
                ledgers.slice(0, 5).map((ledger) => (
                  <View className="home-ledgers__item" key={ledger.id}>
                    <LedgerCard ledger={ledger} />
                  </View>
                ))
              ) : (
                <View className="home-ledgers__empty">
                  <Empty description="还没有账本，快去创建一个吧" />
                </View>
              )}
            </ScrollView>
          </View>

          {/* Recent Entries */}
          <View className="home-section">
            <View className="home-section__header">
              <Text className="home-section__title">最近记账</Text>
            </View>

            <Tabs
              value={activeTab}
              onChange={(value) => setActiveTab(value)}
              type="smile"
              className="home-tabs"
            >
              <Tabs.TabPane title="全部" value="1">
                <LedgerEntries
                  entries={recentEntries}
                  onEntryTap={handleEntryTap}
                  users={user ? [user] : []}
                />
              </Tabs.TabPane>
              <Tabs.TabPane title="支出" value="2">
                <LedgerEntries
                  entries={recentEntries.filter((e) => e.type === "expense")}
                  onEntryTap={handleEntryTap}
                  users={user ? [user] : []}
                />
              </Tabs.TabPane>
              <Tabs.TabPane title="收入" value="3">
                <LedgerEntries
                  entries={recentEntries.filter((e) => e.type === "income")}
                  onEntryTap={handleEntryTap}
                  users={user ? [user] : []}
                />
              </Tabs.TabPane>
            </Tabs>
          </View>
        </>
      )}

      {/* Floating button for quick entry */}
      <FloatingButton icon="add" onClick={handleAddEntry} />

      {/* Entry Modal - for both Add and Edit */}
      <EntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={handleEntryChange}
        editEntry={selectedEntry}
      />
    </View>
  );
};

export default Home;
