import React from 'react';
import { View } from '@tarojs/components';
import { Plus } from '@nutui/icons-react-taro';
import './index.less';

const FloatingButton = ({ onClick, type = 'primary' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <View className={`floating-button floating-button--${type}`} onClick={handleClick}>
      <Plus size={24} color="#FFFFFF" />
    </View>
  );
};

export default FloatingButton; 