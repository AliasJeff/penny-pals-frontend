import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { 
  Avatar, 
  Progress, 
  Tabs, 
  Empty, 
  Skeleton,
  Button,
  Dialog,
  Popup,
  ActionSheet
} from '@nutui/nutui-react-taro';
import { 
  Share, 
  Setting, 
} from '@nutui/icons-react-taro';
import { ledgerService, entryService } from '../../../services';
import EntryItem from '../../../components/EntryItem';
import EntryModal from '../../../components/EntryModal';
import FloatingButton from '../../../components/FloatingButton';
import { getRelativeTimeDesc } from '../../../utils/dateUtils';
import './index.less';

const LedgerDetail = () => {
  const router = useRouter();
  const { id } = router.params;
  
  const [ledger, setLedger] = useState(null);
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [showActions, setShowActions] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Fetch data when component mounts
  useEffect(() => {
    if (id) {
      fetchLedgerData();
    }
  }, [id]);
  
  // Fetch ledger data
  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      // Fetch ledger details
      const ledgerData = await ledgerService.getLedger(id);
      setLedger(ledgerData);
      
      // Fetch ledger entries
      const entriesData = await entryService.listLedgerEntries({
        ledgerId: id,
        orderBy: 'date',
        orderDirection: 'desc'
      });
      setEntries(entriesData || []);
      
      // Fetch ledger users
      const usersData = await ledgerService.listLedgerUsers(id);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      Taro.showToast({
        title: '加载账本数据失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate budget usage
  const calculateBudgetUsage = () => {
    if (!ledger || !ledger.budget || ledger.budget <= 0) return 0;
    
    const expenses = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const percentage = (expenses / ledger.budget) * 100;
    return Math.min(percentage, 100);
  };
  
  // Handle add entry
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
    fetchLedgerData();
  };
  
  // Handle edit ledger
  const handleEditLedger = () => {
    Taro.navigateTo({
      url: `/pages/ledgers/edit/index?id=${id}`
    });
  };
  
  // Handle delete ledger
  const handleDeleteLedger = async () => {
    try {
      await ledgerService.deleteLedger(id);
      
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // Navigate back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('Error deleting ledger:', error);
      Taro.showToast({
        title: '删除失败，请重试',
        icon: 'none'
      });
    }
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
    <View className="ledger-detail-skeleton">
      <Skeleton rows={2} title animated />
      <Skeleton rows={6} animated />
    </View>
  );
  
  return (
    <View className="ledger-detail-page">
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Ledger Header */}
          <View className="ledger-detail-header">
            <View className="ledger-detail-header__actions">
              <View 
                className="ledger-detail-header__action-btn"
                onClick={() => setShowSharePopup(true)}
              >
                <Share size={20} color="#FFFFFF" />
              </View>
              <View 
                className="ledger-detail-header__action-btn"
                onClick={() => setShowActions(true)}
              >
                <Setting size={20} color="#FFFFFF" />
              </View>
            </View>
            
            <View className="ledger-detail-header__content">
              <Text className="ledger-detail-header__name">{ledger?.name}</Text>
              {ledger?.description && (
                <Text className="ledger-detail-header__description">
                  {ledger.description}
                </Text>
              )}
            </View>
          </View>
          
          {/* Budget Progress */}
          {ledger?.budget > 0 && (
            <View className="ledger-detail-budget">
              <View className="ledger-detail-budget__header">
                <Text className="ledger-detail-budget__title">预算</Text>
                <Text className="ledger-detail-budget__amount">¥ {ledger.budget.toFixed(2)}</Text>
              </View>
              <Progress 
                percent={calculateBudgetUsage()} 
                color="#4670FF"
              />
            </View>
          )}
          
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={value => setActiveTab(value)}
            type="smile"
            className="ledger-detail-tabs"
          >
            <Tabs.TabPane title="明细" value="1">
              {entries.length > 0 ? (
                groupEntriesByDate(entries).map(group => (
                  <View className="ledger-detail-entries-group" key={group.date}>
                    <View className="ledger-detail-entries-group__header">
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
                <Empty description="暂无记账记录" />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane title="成员" value="2">
              <View className="ledger-detail-members">
                {users.length > 0 ? (
                  users.map(user => (
                    <View className="ledger-detail-member" key={user.id}>
                      <Avatar 
                        size="small"
                        icon={user.username?.substring(0, 1) || '用'} 
                        background="#4670FF"
                        color="#FFFFFF"
                      />
                      <View className="ledger-detail-member__info">
                        <Text className="ledger-detail-member__name">{user.username}</Text>
                        <Text className="ledger-detail-member__role">{user.role || '成员'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Empty description="暂无成员" />
                )}
                
                <Button 
                  className="ledger-detail-members__invite-btn"
                  onClick={() => Taro.navigateTo({ url: `/pages/ledgers/invite/index?id=${id}` })}
                >
                  邀请成员
                </Button>
              </View>
            </Tabs.TabPane>
          </Tabs>
          
          {/* Floating button for quick entry */}
          <FloatingButton onClick={handleAddEntry} />
          
          {/* Actions Sheet */}
          <ActionSheet
            visible={showActions}
            onClose={() => setShowActions(false)}
            cancelText="取消"
            title="账本操作"
            options={[
              { name: '编辑账本', value: 'edit' },
              { name: '删除账本', value: 'delete', color: '#FF5C5C' }
            ]}
            onSelect={(value) => {
              setShowActions(false);
              if (value.value === 'edit') {
                handleEditLedger();
              } else if (value.value === 'delete') {
                setShowDeleteDialog(true);
              }
            }}
          />
          
          {/* Share Popup */}
          <Popup
            visible={showSharePopup}
            position="bottom"
            round
            onClose={() => setShowSharePopup(false)}
          >
            <View className="ledger-detail-share">
              <View className="ledger-detail-share__header">
                <Text className="ledger-detail-share__title">分享账本</Text>
              </View>
              
              <View className="ledger-detail-share__content">
                <Text className="ledger-detail-share__tip">
                  将账本分享给好友，一起记账
                </Text>
                
                <View className="ledger-detail-share__qrcode">
                  {/* Placeholder for QR code */}
                  <View className="ledger-detail-share__qrcode-placeholder">
                    二维码
                  </View>
                </View>
                
                <Button 
                  type="primary"
                  className="ledger-detail-share__btn"
                >
                  保存二维码
                </Button>
              </View>
            </View>
          </Popup>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            title="删除账本"
            content="确定要删除该账本吗？删除后无法恢复。"
            visible={showDeleteDialog}
            onConfirm={handleDeleteLedger}
            onCancel={() => setShowDeleteDialog(false)}
          />
          
          {/* Entry Modal - for both Add and Edit */}
          <EntryModal 
            visible={showEntryModal}
            onClose={() => setShowEntryModal(false)}
            onSuccess={handleEntryChange}
            editEntry={selectedEntry}
          />
        </>
      )}
    </View>
  );
};

export default LedgerDetail; 