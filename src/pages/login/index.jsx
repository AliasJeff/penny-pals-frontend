import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Button, Toast, Dialog, Checkbox } from "@nutui/nutui-react-taro";
import { userService } from "../../services";
import "./index.less";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Handle WeChat login
  const handleWeChatLogin = async () => {
    if (!termsAgreed) {
      Taro.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
        duration: 1000,
      });
      return;
    }

    setLoading(true);
    try {
      // Get WeChat login code
      const { code } = await Taro.login();

      if (!code) {
        Taro.showToast({
          title: "微信登录失败，请重试",
          icon: "none",
        });
        return;
      }

      // Login with WeChat code
      const userData = await userService.loginWithWeChat(code);

      // Save token
      if (userData && userData.token) {
        Taro.setStorageSync("token", userData.token);
        Taro.setStorageSync("currentUser", userData);

        // Check if there's a pending invite code
        const pendingInviteCode = Taro.getStorageSync("pendingInviteCode");

        if (pendingInviteCode) {
          // Navigate to join page - the code will be retrieved from storage there
          Taro.reLaunch({
            url: "/pages/ledgers/join/index",
          });
        } else {
          // Navigate to home page by default
          Taro.reLaunch({
            url: "/pages/home/index",
          });
        }
      } else {
        throw new Error("登录失败，请重试");
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || "登录失败，请重试",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format dialog content
  const formatDialogContent = (title, content) => {
    const lines = content.split("\n").filter((line) => line.trim());
    return (
      <View>
        <View className="dialog-title">{title}</View>
        {lines.map((line, index) => {
          // Check if the line starts with a number followed by a period (e.g., "1.")
          const isListItem = /^\d+\./.test(line);
          if (isListItem) {
            // Split the list item into number and content
            const [number, ...rest] = line.split(/\.\s/);
            const itemContent = rest.join(". ");
            return (
              <View key={index} className="list-item">
                <Text className="list-number">{number}.</Text>
                <Text className="list-content">{itemContent}</Text>
              </View>
            );
          } else {
            return (
              <View key={index} className="paragraph">
                {line}
              </View>
            );
          }
        })}
      </View>
    );
  };

  return (
    <View className="login-page">
      <View className="login-content">
        <View className="login-logo">
          {/* App Logo */}
          <View className="login-logo__icon">记</View>
          <Text className="login-logo__text">记账小星球</Text>
        </View>

        <View className="login-slogan">
          <Text className="login-slogan__text">轻松记账，智慧生活</Text>
          <Text className="login-slogan__subtext">
            多人协作记账，让记账更简单
          </Text>
        </View>

        <View className="login-buttons">
          <Button
            type="primary"
            block
            loading={loading}
            className="login-buttons__wechat"
            onClick={handleWeChatLogin}
          >
            微信一键登录
          </Button>
        </View>

        <View className="login-agreement">
          <View className="login-checkbox">
            <Checkbox
              checked={termsAgreed}
              onChange={(val) => setTermsAgreed(val)}
            />
            <Text className="login-agreement__text">
              我已阅读并同意
              <Text
                className="login-agreement__link"
                onClick={() => setShowAgreement(true)}
              >
                《用户协议》
              </Text>
              和
              <Text
                className="login-agreement__link"
                onClick={() => setShowPrivacy(true)}
              >
                《隐私政策》
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* User Agreement Dialog */}
      <Dialog
        title="用户协议"
        visible={showAgreement}
        onClose={() => setShowAgreement(false)}
        footerDirection="horizontal"
        closeOnOverlayClick
        content={
          <View className="agreement-content">
            {formatDialogContent(
              "用户协议",
              `
欢迎使用记账小星球！

1. 接受条款
   使用我们的服务，即表示您同意本用户协议的全部条款。

2. 服务说明
   记账小星球提供在线记账及财务管理服务，帮助用户跟踪个人和共享账簿的收支情况。

3. 用户责任
   用户应当提供真实、准确的信息，并对账户安全负责。

4. 隐私保护
   我们重视用户隐私，详情请参阅隐私政策。

5. 服务变更与终止
   我们保留随时修改或终止服务的权利，并会尽可能提前通知用户。

6. 免责声明
   我们不对因用户使用服务而产生的任何损失负责。

7. 适用法律
   本协议受中国法律管辖。
            `
            )}
          </View>
        }
        footer={
          <Button
            type="primary"
            size="small"
            onClick={() => setShowAgreement(false)}
          >
            我已阅读
          </Button>
        }
      />

      {/* Privacy Policy Dialog */}
      <Dialog
        title="隐私政策"
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        footerDirection="horizontal"
        closeOnOverlayClick
        content={
          <View className="privacy-content">
            {formatDialogContent(
              "隐私政策",
              `
记账小星球尊重并保护所有用户的个人隐私权。

1. 信息收集
   我们可能收集您的个人信息，包括但不限于姓名、联系方式和财务数据。

2. 信息使用
   我们使用您的信息来提供、维护和改进我们的服务。

3. 信息共享
   我们不会出售、交换或转让您的个人信息给任何第三方，除非获得您的明确许可。

4. 信息安全
   我们采取合理措施保护您的个人信息安全。

5. Cookie使用
   我们的服务可能使用Cookie或类似技术来提升用户体验。

6. 政策更新
   我们可能更新本隐私政策，并会在应用内通知您重大变更。

7. 联系我们
   如有任何问题，请通过应用内的客服功能联系我们。
            `
            )}
          </View>
        }
        footer={
          <Button
            type="primary"
            size="small"
            onClick={() => setShowPrivacy(false)}
          >
            我已阅读
          </Button>
        }
      />
    </View>
  );
};

export default Login;
