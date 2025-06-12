import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { 
  Form, 
  Input, 
  Button, 
  TextArea, 
  Switch,
  Toast
} from '@nutui/nutui-react-taro';
import { ledgerService } from '../../../services';
import './index.less';

const CreateLedger = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleNameChange = (value) => {
    console.log('nameChange', value);
    setName(value);
  };

  const handleDescriptionChange = (value) => {
    console.log('descriptionChange', value);
    setDescription(value);
  };  
  
  // Submit form
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      Taro.showToast({ title: '请输入账本名称', icon: 'none' });
      return;
    }
    
    setLoading(true);
    try {
      await ledgerService.createLedger({
        name,
        description,
      });
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      });
      
      // Navigate back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('Error creating ledger:', error);
      Taro.showToast({
        title: '创建失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="create-ledger-page">
      <View className="create-ledger-header">
        <Text className="create-ledger-header__title">创建账本</Text>
      </View>
      
      <View className="create-ledger-form">
        <Form>
          <Form.Item name="name" label="账本名称" required>
            <Input 
              placeholder="请输入账本名称" 
              value={name}
              onChange={handleNameChange}
              maxLength={20}
            />
          </Form.Item>
          
          <Form.Item name="description" label="账本描述">
            <Input 
              placeholder="请输入账本描述（选填）" 
              maxLength={40}
              value={description}
              onChange={handleDescriptionChange}
            />
          </Form.Item>
        </Form>
      </View>
      
      <View className="create-ledger-submit">
        <Button 
          type="primary" 
          block
          loading={loading}
          onClick={handleSubmit}
        >
          创建账本
        </Button>
      </View>
    </View>
  );
};

export default CreateLedger; 