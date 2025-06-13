import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Popup, Input, Button } from '@nutui/nutui-react-taro';
import { inviteService } from '../../services';
import './index.less';

/**
 * InvitePopup Component
 * 
 * A reusable popup for generating and sharing invite codes for ledgers
 * 
 * @param {Object} props
 * @param {Boolean} props.visible - Whether the popup is visible
 * @param {Function} props.onClose - Function to close the popup
 * @param {String} props.ledgerId - ID of the ledger to generate an invite code for
 */
const InvitePopup = ({ visible, onClose, ledgerId }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);

  // Generate invite code when popup becomes visible
  useEffect(() => {
    if (visible && ledgerId) {
      generateInviteCode();
    }
  }, [visible, ledgerId]);

  // Generate invite code
  const generateInviteCode = async () => {
    setGeneratingCode(true);
    try {
      const code = await inviteService.createInviteCode(ledgerId);
      setInviteCode(code || '');
    } catch (error) {
      console.error('Error generating invite code:', error);
      Taro.showToast({
        title: '生成邀请码失败',
        icon: 'none'
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  // Handle copying the invite code
  const handleCopyCode = () => {
    if (!inviteCode) return;
    
    Taro.setClipboardData({
      data: inviteCode,
      success: () => {
        Taro.showToast({
          title: '已复制邀请码',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '复制失败，请手动复制',
          icon: 'none'
        });
      }
    });
  };

  return (
    <Popup
      visible={visible}
      position="bottom"
      round
      onClose={onClose}
    >
      <View className="invite-popup">
        <View className="invite-popup__header">
          <Text className="invite-popup__title">邀请成员</Text>
        </View>
        
        <View className="invite-popup__content">
          <Text className="invite-popup__tip">
            生成邀请码，将邀请码发送给好友加入账本
          </Text>
          
          <View className="invite-popup__code-container">
            {generatingCode ? (
              <View className="invite-popup__loading">生成中...</View>
            ) : (
              <>
                <Input 
                  className="invite-popup__code"
                  value={inviteCode}
                  readOnly
                />
                <Button 
                  type="primary"
                  size="small"
                  className="invite-popup__copy-btn"
                  onClick={handleCopyCode}
                >
                  复制
                </Button>
              </>
            )}
          </View>
          
          <View className="invite-popup__instructions">
            <Text className="invite-popup__instructions-title">如何邀请？</Text>
            <Text className="invite-popup__instructions-text">
              1. 右上角点击分享按钮，分享小程序给朋友
            </Text>
            <Text className="invite-popup__instructions-text">
              2. 复制邀请码发送给好友
            </Text>
            <Text className="invite-popup__instructions-text">
              3. 好友登录小程序，输入邀请码后即可加入账本
            </Text>
          </View>
        </View>
      </View>
    </Popup>
  );
};

export default InvitePopup; 