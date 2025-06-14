import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { useRouter, useShareAppMessage, useDidShow } from "@tarojs/taro";
import {
  Avatar,
  Progress,
  Tabs,
  Empty,
  Skeleton,
  Button,
  Dialog,
  Popup,
  ActionSheet,
  Overlay,
} from "@nutui/nutui-react-taro";
import { Share, Setting, ArrowUp } from "@nutui/icons-react-taro";
import { ledgerService, entryService, inviteService } from "../../../services";
import EntryItem from "../../../components/EntryItem";
import EntryModal from "../../../components/EntryModal";
import FloatingButton from "../../../components/FloatingButton";
import InvitePopup from "../../../components/InvitePopup";
import { getRelativeTimeDesc } from "../../../utils/dateUtils";
import "./index.less";

const LedgerDetail = () => {
  const router = useRouter();
  const { id } = router.params;

  const [ledger, setLedger] = useState(null);
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState({
    totalExpense: 0,
    totalIncome: 0,
    entryCount: 0,
  });
  const [showShareGuide, setShowShareGuide] = useState(false);

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
      const ledgerData = await ledgerService.getLedgerDetail(id);
      setLedger(ledgerData);

      // Process entries if they exist in the detail API response
      if (ledgerData.entries && Array.isArray(ledgerData.entries)) {
        setEntries(ledgerData.entries);

        // Calculate stats
        let totalExpense = 0;
        let totalIncome = 0;

        ledgerData.entries.forEach((entry) => {
          if (entry.type === "expense") {
            totalExpense += entry.amount || 0;
          } else if (entry.type === "income") {
            totalIncome += entry.amount || 0;
          }
        });

        setStats({
          totalExpense,
          totalIncome,
          entryCount: ledgerData.entries.length,
        });
      } else {
        // If entries aren't included in the detail response, fetch them separately
        const entriesData = await entryService.listLedgerEntries({
          ledgerId: id,
          orderBy: "date",
          orderDirection: "desc",
        });
        setEntries(entriesData || []);

        // Calculate stats from fetched entries
        let totalExpense = 0;
        let totalIncome = 0;

        if (entriesData && entriesData.length > 0) {
          entriesData.forEach((entry) => {
            if (entry.type === "expense") {
              totalExpense += entry.amount || 0;
            } else if (entry.type === "income") {
              totalIncome += entry.amount || 0;
            }
          });

          setStats({
            totalExpense,
            totalIncome,
            entryCount: entriesData.length,
          });
        }
      }

      // Process users if they exist in the detail API response
      if (ledgerData.members && Array.isArray(ledgerData.members)) {
        setUsers(ledgerData.members);

        // Check if current user is the owner
        const currentUser = Taro.getStorageSync("currentUser") || {};
        const currentUserId = currentUser.id;
        const owner = ledgerData.members.find(
          (member) => member.role === "owner" || member.isOwner
        );
        setIsOwner(owner && owner.id === currentUserId);
      } else {
        // Fetch ledger users separately if not included in detail
        const usersData = await ledgerService.listLedgerUsers(id);
        setUsers(usersData || []);

        // Check if current user is the owner
        const currentUser = Taro.getStorageSync("currentUser") || {};
        const currentUserId = currentUser.id;
        const owner = usersData.find(
          (member) => member.role === "owner" || member.isOwner
        );
        setIsOwner(owner && owner.id === currentUserId);
      }
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      Taro.showToast({
        title: "加载账本数据失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate budget usage
  const calculateBudgetUsage = () => {
    if (!ledger || !ledger.budget || ledger.budget <= 0) return 0;

    const expenses = entries
      .filter((entry) => entry.type === "expense")
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

  // Open invite popup
  const handleShowInvitePopup = () => {
    setShowInvitePopup(true);
  };

  // Handle closing invite popup and refresh members list
  const handleInviteClose = () => {
    setShowInvitePopup(false);
    // Refresh the member list after inviting
    fetchLedgerData();
  };

  // Handle edit ledger
  const handleEditLedger = () => {
    Taro.navigateTo({
      url: `/pages/ledgers/edit/index?id=${id}`,
    });
  };

  // Handle delete ledger
  const handleDeleteLedger = async () => {
    try {
      await ledgerService.deleteLedger(id);

      Taro.showToast({
        title: "删除成功",
        icon: "success",
      });

      // Navigate back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Error deleting ledger:", error);
      Taro.showToast({
        title: "删除失败，请重试",
        icon: "none",
      });
    }
  };

  // Handle leave ledger
  const handleLeaveLedger = async () => {
    try {
      await ledgerService.exitLedger(id);

      Taro.showToast({
        title: "已退出账本",
        icon: "success",
      });

      // Navigate back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Error leaving ledger:", error);
      Taro.showToast({
        title: "退出失败，请重试",
        icon: "none",
      });
    }
  };

  // Group entries by date
  const groupEntriesByDate = (entries) => {
    if (!entries || entries.length === 0) return [];

    const groups = {};
    entries.forEach((entry) => {
      // Get date part only
      const dateStr = entry.date?.split("T")[0] || entry.date;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(entry);
    });

    // Convert to array of { date, entries } objects
    return Object.keys(groups).map((date) => ({
      date,
      relativeDate: getRelativeTimeDesc(date),
      entries: groups[date],
    }));
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View className="ledger-detail-skeleton">
      <Skeleton rows={2} title animated />
      <Skeleton rows={6} animated />
    </View>
  );

  // Register share functionality
  useShareAppMessage(async () => {
    try {
      // Generate invitation code from API
      const code = await inviteService.createInviteCode(id);

      return {
        title: `${ledger?.name || "账本"} - 邀请你一起记账`,
        path: `/pages/ledgers/join/index?inviteCode=${code}`,
        imageUrl: ledger?.icon, // TODO: Use ledger cover image if available, otherwise default mini-program card
      };
    } catch (error) {
      console.error("Error generating invite code:", error);

      // Fallback to sharing without invite code if API call fails
      return {
        title: "邀请你使用记账小星球",
        path: "/pages/home/index",
      };
    }
  });

  useDidShow(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage"],
    });
  });

  // Handle share button click - show guide overlay
  const handleShare = () => {
    setShowShareGuide(true);
    setTimeout(() => {
      setShowShareGuide(false);
    }, 5000); // Auto hide after 5 seconds
  };

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
                onClick={handleShare}
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

            {/* Stats Summary */}
            <View className="ledger-detail-stats">
              <View className="ledger-detail-stats__item">
                <Text className="ledger-detail-stats__value">
                  ¥{stats.totalExpense.toFixed(2)}
                </Text>
                <Text className="ledger-detail-stats__label">总支出</Text>
              </View>
              <View className="ledger-detail-stats__item">
                <Text className="ledger-detail-stats__value">
                  ¥{stats.totalIncome.toFixed(2)}
                </Text>
                <Text className="ledger-detail-stats__label">总收入</Text>
              </View>
              <View className="ledger-detail-stats__item">
                <Text className="ledger-detail-stats__value">
                  {stats.entryCount}
                </Text>
                <Text className="ledger-detail-stats__label">记账笔数</Text>
              </View>
            </View>
          </View>

          {/* Budget Progress */}
          {ledger?.budget > 0 && (
            <View className="ledger-detail-budget">
              <View className="ledger-detail-budget__header">
                <Text className="ledger-detail-budget__title">预算</Text>
                <Text className="ledger-detail-budget__amount">
                  ¥ {ledger.budget.toFixed(2)}
                </Text>
              </View>
              <Progress percent={calculateBudgetUsage()} color="#4670FF" />
            </View>
          )}

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value)}
            type="smile"
            className="ledger-detail-tabs"
          >
            <Tabs.TabPane title="明细" value="1">
              {entries.length > 0 ? (
                groupEntriesByDate(entries).map((group) => (
                  <View
                    className="ledger-detail-entries-group"
                    key={group.date}
                  >
                    <View className="ledger-detail-entries-group__header"></View>
                    {group.entries.map((entry) => (
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
                  users.map((user) => (
                    <View className="ledger-detail-member" key={user.id}>
                      <Avatar
                        size="small"
                        icon={user.username?.substring(0, 1) || "用"}
                        background="#4670FF"
                        color="#FFFFFF"
                      />
                      <View className="ledger-detail-member__info">
                        <Text className="ledger-detail-member__name">
                          {user.username}
                        </Text>
                        <Text className="ledger-detail-member__role">
                          {user.role || "成员"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Empty description="暂无成员" />
                )}

                <Button
                  className="ledger-detail-members__invite-btn"
                  onClick={handleShowInvitePopup}
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
              { name: "编辑账本", value: "edit" },
              isOwner
                ? { name: "删除账本", value: "delete", color: "#FF5C5C" }
                : { name: "退出账本", value: "leave", color: "#FF5C5C" },
            ]}
            onSelect={(value) => {
              setShowActions(false);
              if (value.value === "edit") {
                handleEditLedger();
              } else if (value.value === "delete") {
                setShowDeleteDialog(true);
              } else if (value.value === "leave") {
                setShowLeaveDialog(true);
              }
            }}
          />

          {/* Use the reusable InvitePopup component */}
          <InvitePopup
            visible={showInvitePopup}
            onClose={handleInviteClose}
            ledgerId={id}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            title="删除账本"
            content="确定要删除该账本吗？删除后无法恢复。"
            visible={showDeleteDialog}
            onConfirm={handleDeleteLedger}
            onCancel={() => setShowDeleteDialog(false)}
          />

          {/* Leave Confirmation Dialog */}
          <Dialog
            title="退出账本"
            content="确定要退出该账本吗？退出后需要重新接受邀请才能加入。"
            visible={showLeaveDialog}
            onConfirm={handleLeaveLedger}
            onCancel={() => setShowLeaveDialog(false)}
          />

          {/* Entry Modal - for both Add and Edit */}
          <EntryModal
            visible={showEntryModal}
            onClose={() => setShowEntryModal(false)}
            onSuccess={handleEntryChange}
            editEntry={selectedEntry}
          />

          {/* Share Guide Overlay */}
          <Overlay
            visible={showShareGuide}
            onClick={() => setShowShareGuide(false)}
          >
            <View className="share-guide-overlay">
              <View className="share-guide-arrow">
                <ArrowUp size={36} color="#FFFFFF" />
              </View>
              <View className="share-guide-text">
                <Text>点击右上角"..."</Text>
                <Text>分享发送给朋友</Text>
              </View>
            </View>
          </Overlay>
        </>
      )}
    </View>
  );
};

export default LedgerDetail;
