import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Avatar, Empty, Skeleton, Tabs } from '@nutui/nutui-react-taro';
import { userService, ledgerService, entryService } from '../../services';
import FloatingButton from '../../components/FloatingButton';
import LedgerCard from '../../components/LedgerCard';
import EntryItem from '../../components/EntryItem';
import EntryModal from '../../components/EntryModal';
import { getRelativeTimeDesc } from '../../utils/dateUtils';
import './index.less';

const Home = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [ledgers, setLedgers] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Fetch data when page shows
  useDidShow(() => {
    fetchData();
  });

  // Fetch all required data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user info
      const userData = await userService.getCurrentUser();
      setUser(userData);

      // Fetch ledgers
      const ledgersData = await ledgerService.getMyLedgers();
      setLedgers(ledgersData || []);

      // Fetch recent entries
      const entries = await entryService.listMyEntries({
        orderBy: 'date',
        orderDirection: 'desc',
        pageSize: 10
      });
      setRecentEntries(entries || []);

      // Calculate balance (simplified for now)
      calculateBalance(entries);
    } catch (error) {
      console.error('Error fetching data:', error);
      Taro.showToast({
        title: '加载数据失败，请重试',
        icon: 'none'
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
      if (entry.type === 'income') {
        return acc + entry.amount;
      } else if (entry.type === 'expense') {
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

  // Group entries by date
  const groupEntriesByDate = (entries) => {
    if (!entries || entries.length === 0) return [];

    const groups = {};
    entries.forEach(entry => {
      // Get date part only
      const dateStr = entry.date?.split('T')[0] || entry.date;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(entry);
    });

    // Convert to array of { date, entries } objects
    return Object.keys(groups).map(date => ({
      date,
      relativeDate: getRelativeTimeDesc(date),
      entries: groups[date]
    }));
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
              <Avatar style={{ backgroundClip: '#ff0f23', color: '#5272f9', fontSize: '20px', fontWeight: 700 }}>
                {user?.username?.substring(0, 1) || '...'}
              </Avatar>
              <Text className="home-header__username">{user?.username || '用户'}</Text>
            </View>
            <View className="home-header__balance">
              <Text className="home-header__balance-label">当前余额</Text>
              <Text className="home-header__balance-amount">¥ {balance.toFixed(2)}</Text>
            </View>
          </View>
          
          {/* My Ledgers */}
          <View className="home-section">
            <View className="home-section__header">
              <Text className="home-section__title">我的账本</Text>
              <Text 
                className="home-section__more"
                onClick={() => Taro.switchTab({ url: '/pages/ledgers/index' })}
              >
                查看全部
              </Text>
            </View>
            
            <ScrollView 
              className="home-ledgers"
              scrollX
              showScrollbar={false}
            >
              {ledgers.length > 0 ? (
                ledgers.slice(0, 5).map(ledger => (
                  <View className="home-ledgers__item" key={ledger.id}>
                    <LedgerCard ledger={ledger} />
                  </View>
                ))
              ) : (
                <View className="home-ledgers__empty">
                  <Empty 
                    description="还没有账本，快去创建一个吧" 
                  />
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
              onChange={value => setActiveTab(value)}
              type="smile"
              className="home-tabs"
            >
              <Tabs.TabPane title="全部" value="1">
                {recentEntries.length > 0 ? (
                  groupEntriesByDate(recentEntries).map((group, index) => (
                    <View className="home-entries-group" key={index}>
                      <View className="home-entries-group__header">
                        {/* <Text className="home-entries-group__date">
                          {group.relativeDate}
                        </Text> */}
                      </View>
                      {group.entries.map(entry => (
                        <EntryItem 
                          key={entry.id} 
                          entry={entry} 
                          onTap={handleEntryTap}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <Empty description="还没有记账记录" />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane title="支出" value="2">
                {recentEntries.filter(e => e.type === 'expense').length > 0 ? (
                  groupEntriesByDate(recentEntries.filter(e => e.type === 'expense')).map(group => (
                    <View className="home-entries-group" key={group.date}>
                      <View className="home-entries-group__header">
                        {/* <Text className="home-entries-group__date">
                          {group.relativeDate}
                        </Text> */}
                      </View>
                      {group.entries.map(entry => (
                        <EntryItem 
                          key={entry.id} 
                          entry={entry} 
                          onTap={handleEntryTap}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <Empty description="还没有支出记录" />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane title="收入" value="3">
                {recentEntries.filter(e => e.type === 'income').length > 0 ? (
                  groupEntriesByDate(recentEntries.filter(e => e.type === 'income')).map(group => (
                    <View className="home-entries-group" key={group.date}>
                      <View className="home-entries-group__header">
                        {/* <Text className="home-entries-group__date">
                          {group.relativeDate}
                        </Text> */}
                      </View>
                      {group.entries.map(entry => (
                        <EntryItem 
                          key={entry.id} 
                          entry={entry} 
                          onTap={handleEntryTap}
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <Empty description="还没有收入记录" />
                )}
              </Tabs.TabPane>
            </Tabs>
          </View>
        </>
      )}
      
      {/* Floating button for quick entry */}
      <FloatingButton onClick={handleAddEntry} />

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