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
    // If inviteCode is provided in URL, store it in storage
    if (inviteCode) {
      Taro.setStorageSync("pendingInviteCode", inviteCode);
    }

    // Get the invite code from storage if not in URL
    const storedInviteCode = Taro.getStorageSync("pendingInviteCode");

    // Check if user is logged in
    if (!currentUser) {
      // Redirect to login page without parameters
      Taro.navigateTo({
        url: `/pages/login/index`,
      });
      return;
    }

    // If user is logged in and has invite code (from URL or storage), process it
    if (inviteCode || storedInviteCode) {
      const codeToUse = inviteCode || storedInviteCode;
      console.log(
        "User logged in with invite code, processing invite:",
        codeToUse
      );
      processInviteCode(codeToUse);
    } else {
      console.log("User logged in but no invite code found");
    }
  }, [inviteCode, currentUser]);

  // Join ledger with invite code
  const processInviteCode = async (codeToUse = inviteCode) => {
    console.log("Starting to process invite code:", codeToUse);
    setLoading(true);
    setError("");
    setSuccess(false); // Reset success state

    try {
      await inviteService.joinByCode(codeToUse);

      console.log("Successfully joined ledger with invite code");
      setSuccess(true);

      // Clear the stored invite code after successful processing
      Taro.removeStorageSync("pendingInviteCode");

      // Show success message
      Taro.showToast({
        title: "加入账本成功",
        icon: "success",
        duration: 2000,
      });

      // Navigate to the ledger detail page after successful join
      setTimeout(() => {
        Taro.switchTab({
          url: `/pages/home/index`,
        });
      }, 2000);
    } catch (error) {
      console.error("Error joining ledger:", error);
      setError(error.message || "加入账本失败，请重试");
      setSuccess(false);

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
            <Text className="join-ledger-success-desc">正在跳转...</Text>
            <Button
              type="primary"
              className="join-ledger-button"
              onClick={() => Taro.switchTab({ url: "/pages/home/index" })}
            >
              立即前往主页
            </Button>
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
