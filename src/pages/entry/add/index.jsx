import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { 
  Form, 
  Input, 
  Button, 
  Radio, 
  DatePicker, 
  TextArea, 
  Tabs, 
  Picker, 
  NumberKeyboard 
} from '@nutui/nutui-react-taro';
import { ledgerService, entryService } from '../../../services';
import './index.less';

const AddEntry = () => {
  const [form, setForm] = useState({
    ledgerId: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [ledgers, setLedgers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLedgerPicker, setShowLedgerPicker] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Expense categories
  const expenseCategories = [
    '餐饮', '购物', '日用', '交通', '娱乐', '医疗', 
    '住房', '通讯', '学习', '人情', '其他'
  ];
  
  // Income categories
  const incomeCategories = [
    '工资', '奖金', '兼职', '理财', '报销', '红包', '其他'
  ];
  
  // Get current categories based on type
  const currentCategories = form.type === 'expense' ? expenseCategories : incomeCategories;
  
  // Fetch ledgers when component mounts
  useEffect(() => {
    fetchLedgers();
  }, []);
  
  // Fetch user's ledgers
  const fetchLedgers = async () => {
    try {
      const data = await ledgerService.getMyLedgers();
      setLedgers(data || []);
      
      // Set default ledger if available
      if (data && data.length > 0) {
        setForm(prev => ({ ...prev, ledgerId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      Taro.showToast({
        title: '加载账本失败',
        icon: 'none'
      });
    }
  };
  
  // Handle form input changes
  const handleInputChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date selection
  const handleDateSelect = (value) => {
    setShowDatePicker(false);
    setForm(prev => ({ ...prev, date: value }));
  };
  
  // Handle ledger selection
  const handleLedgerSelect = (value) => {
    setShowLedgerPicker(false);
    setForm(prev => ({ ...prev, ledgerId: value.value }));
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setForm(prev => ({ ...prev, category }));
  };
  
  // Handle number input from keyboard
  const handleNumberInput = (value) => {
    if (value === 'close') {
      setShowKeyboard(false);
      return;
    }
    
    if (value === 'confirm') {
      setShowKeyboard(false);
      return;
    }
    
    if (value === 'delete') {
      setForm(prev => ({ 
        ...prev, 
        amount: prev.amount.length > 0 ? prev.amount.slice(0, -1) : '' 
      }));
      return;
    }
    
    // Handle decimal point
    if (value === '.') {
      if (form.amount.includes('.')) return;
      setForm(prev => ({ ...prev, amount: prev.amount + value }));
      return;
    }
    
    // Regular number
    setForm(prev => ({ ...prev, amount: prev.amount + value }));
  };
  
  // Submit form
  const handleSubmit = async () => {
    // Validate form
    if (!form.ledgerId) {
      Taro.showToast({ title: '请选择账本', icon: 'none' });
      return;
    }
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    
    if (!form.category) {
      Taro.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    
    setLoading(true);
    try {
      await entryService.createEntry({
        ...form,
        amount: parseFloat(form.amount)
      });
      
      Taro.showToast({
        title: '记账成功',
        icon: 'success'
      });
      
      // Navigate back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('Error creating entry:', error);
      Taro.showToast({
        title: '记账失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get current ledger name
  const getCurrentLedgerName = () => {
    const ledger = ledgers.find(l => l.id === form.ledgerId);
    return ledger ? ledger.name : '请选择账本';
  };
  
  return (
    <View className="add-entry-page">
      <View className="add-entry-header">
        <Text className="add-entry-header__title">记一笔</Text>
      </View>
      
      {/* Type Selector */}
      <View className="add-entry-type">
        <Tabs 
          value={form.type === 'expense' ? '1' : '2'}
          onChange={(value) => handleInputChange('type', value === '1' ? 'expense' : 'income')}
          type="smile"
        >
          <Tabs.TabPane title="支出" value="1" />
          <Tabs.TabPane title="收入" value="2" />
        </Tabs>
      </View>
      
      {/* Amount Input */}
      <View className="add-entry-amount">
        <View className="add-entry-amount__prefix">¥</View>
        <View 
          className="add-entry-amount__input"
          onClick={() => setShowKeyboard(true)}
        >
          {form.amount || '0.00'}
        </View>
      </View>
      
      {/* Category Selection */}
      <View className="add-entry-categories">
        <View className="add-entry-categories__title">分类</View>
        <View className="add-entry-categories__list">
          {currentCategories.map((category) => (
            <View 
              key={category}
              className={`add-entry-categories__item ${form.category === category ? 'add-entry-categories__item--active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </View>
          ))}
        </View>
      </View>
      
      {/* Form Fields */}
      <View className="add-entry-form">
        <Form>
          <Form.Item label="账本">
            <View 
              className="add-entry-form__picker"
              onClick={() => setShowLedgerPicker(true)}
            >
              {getCurrentLedgerName()}
            </View>
          </Form.Item>
          
          <Form.Item label="日期">
            <View 
              className="add-entry-form__picker"
              onClick={() => setShowDatePicker(true)}
            >
              {form.date}
            </View>
          </Form.Item>
          
          <Form.Item label="备注">
            <TextArea 
              placeholder="添加备注（选填）" 
              maxLength={100}
              value={form.note}
              onChange={(value) => handleInputChange('note', value)}
            />
          </Form.Item>
        </Form>
      </View>
      
      {/* Submit Button */}
      <View className="add-entry-submit">
        <Button 
          type="primary" 
          block
          loading={loading}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </View>
      
      {/* Date Picker */}
      <DatePicker
        visible={showDatePicker}
        title="选择日期"
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateSelect}
      />
      
      {/* Ledger Picker */}
      <Picker
        visible={showLedgerPicker}
        options={ledgers.map(ledger => ({ text: ledger.name, value: ledger.id }))}
        onClose={() => setShowLedgerPicker(false)}
        onConfirm={handleLedgerSelect}
      />
      
      {/* Number Keyboard */}
      <NumberKeyboard
        visible={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onChange={handleNumberInput}
        type="rightColumn"
        custom={['.', 'delete']}
        confirmText="确定"
      />
    </View>
  );
};

export default AddEntry; 