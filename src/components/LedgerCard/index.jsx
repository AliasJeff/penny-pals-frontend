import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Avatar } from '@nutui/nutui-react-taro';
import './index.less';

const LedgerCard = ({ ledger, onTap }) => {
  const { id, name, description, icon } = ledger;

  // Navigate to ledger detail page
  const handleTap = () => {
    if (onTap) {
      onTap(ledger);
    } else {
      Taro.navigateTo({
        url: `/pages/ledgers/detail/index?id=${id}`
      });
    }
  };

  return (
    <View className="ledger-card" onClick={handleTap}>
      <View className="ledger-card__header">
        {icon ? (
          <Image className="ledger-card__icon" src={icon} mode="aspectFill" />
        ) : (
          <Avatar 
            className="ledger-card__avatar"
            background="#4670FF"
            color="#ffffff"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            {name.substring(0, 1).toUpperCase()} 
          </Avatar>
        )}
        <View className="ledger-card__info">
          <Text className="ledger-card__name">{name}</Text>
          {description && (
            <Text className="ledger-card__description">{description}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default LedgerCard; 