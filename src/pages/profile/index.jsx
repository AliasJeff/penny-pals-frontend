import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import {
  Avatar,
  Cell,
  Button,
  Toast,
  Dialog,
  Skeleton,
} from "@nutui/nutui-react-taro";
import { userService } from "../../services";
import { getAvatarSrc } from "../../utils/avatarUtils";
import "./index.less";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch user data when page shows
  useDidShow(() => {
    fetchUserData();
  });

  // Handle pull-down refresh
  usePullDownRefresh(() => {
    setRefreshing(true);
    fetchUserData().finally(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    });
  });

  // Fetch user data
  const fetchUserData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Taro.showToast({
        title: "加载用户数据失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Taro.clearStorageSync();
    Taro.reLaunch({ url: "/pages/login/index" });
  };

  // Handle avatar click
  const handleEditProfile = () => {
    Taro.navigateTo({ url: "/pages/profile/edit/index" });
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View className="profile-skeleton">
      <Skeleton rows={1} title animated />
      <Skeleton rows={4} animated />
    </View>
  );

  return (
    <View className="profile-page">
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* User Info Header */}
          <View className="profile-header">
            <View
              className="profile-header__avatar"
              onClick={handleEditProfile}
            >
              {user?.avatar && getAvatarSrc(user.avatar) ? (
                <Image
                  className="profile-header__avatar-image"
                  src={getAvatarSrc(user.avatar)}
                />
              ) : (
                <Avatar
                  size="large"
                  background="#4670FF"
                  color="#FFFFFF"
                  style={{ fontSize: "24px", fontWeight: 700 }}
                >
                  {user?.username?.substring(0, 1) || "..."}
                </Avatar>
              )}
            </View>

            <View className="profile-header__info">
              <Text className="profile-header__name">
                {user?.username || "用户"}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className="profile-menu">
            <Cell title="👤 个人资料" onClick={handleEditProfile} />

            {/* <Cell
              title="🔔 消息通知"
              onClick={() =>
                Taro.navigateTo({ url: "/pages/profile/notifications/index" })
              }
            /> */}

            {/* <Cell
              title="⚙️ 设置"
              onClick={() =>
                Taro.navigateTo({ url: "/pages/profile/settings/index" })
              }
            /> */}

            <Cell
              title="❓ 帮助与反馈"
              onClick={() =>
                Taro.navigateTo({ url: "/pages/profile/help/index" })
              }
            />

            {/* <Cell
              title="ℹ️ 关于我们"
              onClick={() =>
                Taro.navigateTo({ url: "/pages/profile/about/index" })
              }
            /> */}
          </View>

          {/* Logout Button */}
          <View className="profile-actions">
            <Button
              type="default"
              className="profile-actions__logout-btn"
              onClick={() => setShowLogoutDialog(true)}
            >
              退出登录
            </Button>
          </View>
        </>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        title="提示"
        content="确定要退出登录吗？"
        visible={showLogoutDialog}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </View>
  );
};

export default Profile;
