import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { Button } from "@nutui/nutui-react-taro";
import { inviteService, ledgerService } from "../../../services";
import "./index.less";

const JoinLedger = () => {
  const router = useRouter();
  const { inviteCode } = router.params;

  const currentUser = Taro.getStorageSync("currentUser");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check login status and process invite code when component mounts
  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      // Redirect to login page with return URL
      Taro.navigateTo({
        url: `/pages/login/index?redirect=/pages/ledgers/join/index&inviteCode=${
          inviteCode || ""
        }`,
      });
      return;
    }

    // If user is logged in and has invite code, process it
    if (inviteCode) {
      processInviteCode();
    }
  }, [inviteCode]);

  // Join ledger with invite code
  const processInviteCode = async () => {
    setLoading(true);
    setError("");

    try {
      await inviteService.joinByCode(inviteCode);

      setSuccess(true);

      // Show success message
      Taro.showToast({
        title: "加入账本成功",
        icon: "success",
        duration: 2000,
      });

      // Navigate to the ledger detail page after successful join
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/home/index`,
        });
      }, 2000);
    } catch (error) {
      console.error("Error joining ledger:", error);
      setError(error.message || "加入账本失败，请重试");

      // Show error toast
      Taro.showToast({
        title: error.message || "加入账本失败，请重试",
        icon: "none",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual join attempt
  const handleJoinLedger = () => {
    processInviteCode();
  };

  return (
    <View className="join-ledger-page">
      <View className="join-ledger-container">
        <View className="join-ledger-header">
          <Text className="join-ledger-title">加入账本</Text>

          {inviteCode ? (
            <Text className="join-ledger-subtitle">
              你收到了一个邀请，正在处理...
            </Text>
          ) : (
            <Text className="join-ledger-subtitle">邀请码无效或已过期</Text>
          )}
        </View>

        {loading && (
          <View className="join-ledger-loading">
            <Text>正在处理邀请...</Text>
          </View>
        )}

        {error && !loading && (
          <View className="join-ledger-error">
            <Text className="join-ledger-error-text">{error}</Text>
            <Button
              type="primary"
              className="join-ledger-button"
              onClick={() => Taro.switchTab({ url: "/pages/home/index" })}
            >
              返回
            </Button>
          </View>
        )}

        {success && (
          <View className="join-ledger-success">
            <Text className="join-ledger-success-title">成功加入账本</Text>
            <Text className="join-ledger-success-desc">正在跳转到账本...</Text>
          </View>
        )}

        {!loading && !success && !error && inviteCode && (
          <Button
            type="primary"
            className="join-ledger-button"
            loading={loading}
            onClick={handleJoinLedger}
          >
            加入账本
          </Button>
        )}
      </View>
    </View>
  );
};

export default JoinLedger;
