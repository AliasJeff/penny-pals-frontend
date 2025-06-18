import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  Button,
  DatePicker,
  Input,
  Tabs,
  Picker,
  NumberKeyboard,
  Popup,
} from "@nutui/nutui-react-taro";
import { ledgerService, entryService } from "../../services";
import { getCategoriesByType } from "../../utils/categoryUtils";
import CustomTag from "../CustomTag";
import "./index.less";

const EntryModal = ({ visible, onClose, onSuccess, editEntry = null }) => {
  const isEditMode = editEntry !== null;

  const [form, setForm] = useState({
    ledgerId: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [ledgers, setLedgers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLedgerPicker, setShowLedgerPicker] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteHistory, setNoteHistory] = useState({});

  // Get categories with icons based on type
  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");

  // Get current categories based on type
  const currentCategories =
    form.type === "expense" ? expenseCategories : incomeCategories;

  // Load category-specific note history from storage
  useEffect(() => {
    const savedNotes = Taro.getStorageSync("categoryNoteHistory") || {};
    setNoteHistory(savedNotes);
  }, []);

  // Initialize form when modal opens or editEntry changes
  useEffect(() => {
    if (visible) {
      fetchLedgers();

      if (isEditMode && editEntry) {
        // Populate form with entry data for editing
        setForm({
          ledgerId: editEntry.ledgerId || "",
          amount: editEntry.amount ? String(Math.abs(editEntry.amount)) : "",
          type: editEntry.type || "expense",
          category: editEntry.category || "",
          date:
            editEntry.date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          note: editEntry.note || "",
        });
      } else {
        // Reset form for new entry
        setForm({
          ledgerId: ledgers.length > 0 ? ledgers[0]?.id : "",
          amount: "",
          type: "expense",
          category: "",
          date: new Date().toISOString().split("T")[0],
          note: "",
        });
      }
    }
  }, [visible, editEntry]);

  // Fetch user's ledgers
  const fetchLedgers = async () => {
    try {
      const data = await ledgerService.getMyLedgers();
      setLedgers(data || []);

      // Set default ledger if available
      if (data && data.length > 0 && !form.ledgerId) {
        setForm((prev) => ({ ...prev, ledgerId: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      Taro.showToast({
        title: "加载账本失败",
        icon: "none",
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date selection
  const handleDateSelect = (dateArray) => {
    const year = dateArray[0].value;
    const month = dateArray[1].value;
    const day = dateArray[2].value;

    const formattedDate = `${year}-${month}-${day}`;

    setShowDatePicker(false);
    setForm((prev) => ({ ...prev, date: formattedDate }));
  };

  // Handle ledger selection
  const handleLedgerSelect = (value) => {
    setShowLedgerPicker(false);
    setForm((prev) => ({ ...prev, ledgerId: value.value }));
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setForm((prev) => ({ ...prev, category }));
  };

  // Handle number input from keyboard
  const handleNumberInput = (value) => {
    if (value === "close") {
      setShowKeyboard(false);
      return;
    }

    if (value === "confirm") {
      setShowKeyboard(false);
      return;
    }

    if (value === "delete") {
      setForm((prev) => ({
        ...prev,
        amount: prev.amount.length > 0 ? prev.amount.slice(0, -1) : "",
      }));
      return;
    }

    // Handle decimal point
    if (value === ".") {
      if (form.amount.includes(".")) return;
      setForm((prev) => ({ ...prev, amount: prev.amount + value }));
      return;
    }

    // Regular number
    setForm((prev) => ({ ...prev, amount: prev.amount + value }));
  };

  const handleNumberDelete = () => {
    setForm((prev) => ({
      ...prev,
      amount: prev.amount.length > 0 ? prev.amount.slice(0, -1) : "",
    }));
  };

  // Apply tag content to note
  const handleTagClick = (note) => {
    setForm((prev) => ({ ...prev, note }));
  };

  // Save note to category-specific history
  const saveNoteToHistory = (note, category) => {
    if (!note.trim() || !category) return;

    const categoryHistory = noteHistory[category] || [];
    const updatedCategoryHistory = [
      note,
      ...categoryHistory.filter((item) => item !== note),
    ].slice(0, 5);

    const updatedHistory = {
      ...noteHistory,
      [category]: updatedCategoryHistory,
    };

    setNoteHistory(updatedHistory);
    Taro.setStorageSync("categoryNoteHistory", updatedHistory);
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate form
    if (!form.ledgerId) {
      Taro.showToast({ title: "请选择账本", icon: "none" });
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      Taro.showToast({ title: "请输入有效金额", icon: "none" });
      return;
    }

    if (!form.category) {
      Taro.showToast({ title: "请选择分类", icon: "none" });
      return;
    }

    // Save note to category-specific history if not empty
    if (form.note.trim()) {
      saveNoteToHistory(form.note, form.category);
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // Update existing entry
        await entryService.updateEntry({
          id: editEntry.id,
          ...form,
          amount: parseFloat(form.amount),
        });

        Taro.showToast({
          title: "更新成功",
          icon: "success",
        });
      } else {
        // Create new entry
        await entryService.createEntry({
          ...form,
          amount: parseFloat(form.amount),
        });

        Taro.showToast({
          title: "记账成功",
          icon: "success",
        });
      }

      // Close modal and notify parent component
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error saving entry:", error);
      Taro.showToast({
        title: isEditMode ? "更新失败，请重试" : "记账失败，请重试",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!isEditMode || !editEntry?.id) return;

    Taro.showModal({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
      confirmColor: "#ff4d4f",
      success: async (res) => {
        if (res.confirm) {
          setLoading(true);
          try {
            await entryService.deleteEntry({ id: editEntry.id });
            Taro.showToast({
              title: "删除成功",
              icon: "success",
            });
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          } catch (error) {
            console.error("Error deleting entry:", error);
            Taro.showToast({
              title: "删除失败，请重试",
              icon: "none",
            });
          } finally {
            setLoading(false);
          }
        }
      },
    });
  };

  // Get current ledger name
  const getCurrentLedgerName = () => {
    const ledger = ledgers.find((l) => l.id === form.ledgerId);
    return ledger ? ledger.name : "请选择账本";
  };

  // Get current category's note history
  const getCurrentCategoryNotes = () => {
    if (!form.category) return [];
    return noteHistory[form.category] || [];
  };

  return (
    <Popup
      visible={visible}
      position="bottom"
      round
      onClose={onClose}
      destroyOnClose
      style={{ height: "90vh" }}
      overlay
    >
      <ScrollView scrollY={true} style={{ height: "100%" }}>
        <View className="entry-modal">
          <View className="entry-modal-header">
            <Text className="entry-modal-header__title">
              {isEditMode ? "编辑记录" : "记一笔"}
            </Text>
            <View className="entry-modal-header__close" onClick={onClose}>
              X
            </View>
          </View>

          {/* Type Selector */}
          <View className="entry-modal-type">
            <Tabs
              value={form.type === "expense" ? "1" : "2"}
              onChange={(value) =>
                handleInputChange("type", value === "1" ? "expense" : "income")
              }
              type="smile"
            >
              <Tabs.TabPane title="支出" value="1" />
              <Tabs.TabPane title="收入" value="2" />
            </Tabs>
          </View>

          {/* Amount Input */}
          <View className="entry-modal-amount">
            <View className="entry-modal-amount__prefix">¥</View>
            <View
              className="entry-modal-amount__input"
              onClick={() => setShowKeyboard(true)}
            >
              {form.amount || "0.00"}
            </View>
          </View>

          {/* Category Selection */}
          <View className="entry-modal-categories">
            <View className="entry-modal-categories__list">
              {currentCategories.map((categoryItem) => (
                <View
                  key={categoryItem.name}
                  className={`entry-modal-categories__item ${
                    form.category === categoryItem.name
                      ? "entry-modal-categories__item--active"
                      : ""
                  }`}
                  onClick={() => handleCategorySelect(categoryItem.name)}
                >
                  <Image
                    className="entry-modal-categories__item-icon"
                    src={categoryItem.icon}
                    mode="aspectFit"
                  />
                  <Text className="entry-modal-categories__item-text">
                    {categoryItem.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Form Fields */}
          <View className="entry-modal-form">
            <View className="entry-modal-form-item">
              <View className="entry-modal-form-item__label">账本</View>
              <View
                className="entry-modal-form__picker"
                onClick={() => setShowLedgerPicker(true)}
              >
                {getCurrentLedgerName()}
              </View>
            </View>

            <View className="entry-modal-form-item">
              <View className="entry-modal-form-item__label">日期</View>
              <View
                className="entry-modal-form__picker"
                onClick={() => setShowDatePicker(true)}
              >
                {form.date}
              </View>
            </View>

            <View className="entry-modal-form-item">
              <View className="entry-modal-form-item__label">备注</View>
              <Input
                placeholder="添加备注（选填）"
                maxLength={50}
                value={form.note}
                onChange={(value) => handleInputChange("note", value)}
              />
            </View>
            {!form.note &&
              form.category &&
              getCurrentCategoryNotes().length > 0 && (
                <View className="entry-modal-note-tags">
                  {getCurrentCategoryNotes().map((note, index) => (
                    <CustomTag key={index} onClick={() => handleTagClick(note)}>
                      {note}
                    </CustomTag>
                  ))}
                </View>
              )}
          </View>

          {/* Action Buttons */}
          <View className="entry-modal-actions">
            {isEditMode && (
              <Button
                className="entry-modal-actions__delete"
                onClick={handleDelete}
                disabled={loading}
              >
                删除
              </Button>
            )}
            <Button
              className="entry-modal-actions__save"
              type="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {isEditMode ? "更新" : "保存"}
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      <DatePicker
        visible={showDatePicker}
        value={form.date}
        defaultValue={form.date}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateSelect}
        minDate="2020-01-01"
      />

      {/* Ledger Picker */}
      <Picker
        visible={showLedgerPicker}
        options={ledgers.map((l) => ({ value: l.id, text: l.name }))}
        onClose={() => setShowLedgerPicker(false)}
        onConfirm={handleLedgerSelect}
      />

      {/* Number Keyboard */}
      <NumberKeyboard
        visible={showKeyboard}
        type="rightColumn"
        onClose={() => setShowKeyboard(false)}
        onConfirm={() => setShowKeyboard(false)}
        onDelete={handleNumberDelete}
        onChange={handleNumberInput}
        custom={["", "."]}
        randomKeys={false}
        confirmText="完成"
      />
    </Popup>
  );
};

export default EntryModal;
