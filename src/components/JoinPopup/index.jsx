import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Popup, Input, Button } from "@nutui/nutui-react-taro";
import { inviteService } from "../../services";
import "./index.less";

/**
 * JoinPopup Component
 *
 * A reusable popup for joining ledgers using invite codes
 *
 * @param {Object} props
 * @param {Boolean} props.visible - Whether the popup is visible
 * @param {Function} props.onClose - Function to close the popup
 */
const JoinPopup = ({ visible, onClose }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Reset input when popup becomes visible
  React.useEffect(() => {
    if (visible) {
      setInviteCode("");
    }
  }, [visible]);

  // Handle input change
  const handleCodeChange = (value) => {
    setInviteCode(value);
  };

  // Handle joining the ledger
  const handleJoinLedger = async () => {
    if (!inviteCode.trim()) {
      Taro.showToast({
        title: "请输入邀请码",
        icon: "none",
      });
      return;
    }

    setJoining(true);
    try {
      await inviteService.joinByCode(inviteCode);
      Taro.showToast({
        title: "成功加入账本",
        icon: "success",
      });
      onClose(); // Close popup after successful join
    } catch (error) {
      console.error("Error joining ledger:", error);
      Taro.showToast({
        title: "加入失败，请检查邀请码是否正确",
        icon: "none",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <Popup visible={visible} position="bottom" round onClose={onClose}>
      <View className="join-popup">
        <View className="join-popup__header">
          <Text className="join-popup__title">加入账本</Text>
        </View>

        <View className="join-popup__content">
          <Text className="join-popup__tip">
            输入好友分享的邀请码，加入共享账本
          </Text>

          <View className="join-popup__code-container">
            <Input
              className="join-popup__code"
              value={inviteCode}
              placeholder="请输入邀请码"
              onChange={(val) => handleCodeChange(val)}
            />
          </View>

          <Button
            className="join-popup__join-btn"
            type="primary"
            block
            loading={joining}
            disabled={joining}
            onClick={handleJoinLedger}
          >
            {joining ? "加入中..." : "加入账本"}
          </Button>

          <View className="join-popup__instructions">
            <Text className="join-popup__instructions-title">
              如何获取邀请码？
            </Text>
            <Text className="join-popup__instructions-text">
              1. 请好友在"我的账本"页面选择一个账本
            </Text>
            <Text className="join-popup__instructions-text">
              2. 点击"邀请成员"生成邀请码
            </Text>
            <Text className="join-popup__instructions-text">
              3. 输入好友分享的邀请码加入账本
            </Text>
          </View>
        </View>
      </View>
    </Popup>
  );
};

export default JoinPopup;
