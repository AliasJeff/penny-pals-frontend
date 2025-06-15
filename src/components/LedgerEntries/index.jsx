import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  Empty,
  Popup,
  Button,
  Range,
  DatePicker,
  Divider,
} from "@nutui/nutui-react-taro";
import { Filter, ArrowDown, Close } from "@nutui/icons-react-taro";
import EntryItem from "../EntryItem";
import { getRelativeTimeDesc, useDatePicker } from "../../utils/dateUtils";
import "./index.less";

// Custom Tag component
const CustomTag = ({
  children,
  selected,
  onClose,
  onClick,
  closeable = false,
}) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  return (
    <View
      className={`custom-tag ${selected ? "custom-tag-selected" : ""}`}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        fontSize: "12px",
        borderRadius: "16px",
        marginRight: "8px",
        marginBottom: "8px",
        backgroundColor: selected ? "#4a90e2" : "#f5f5f5",
        color: selected ? "white" : "#333",
        border: selected ? "none" : "1px solid #e0e0e0",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <Text>{children}</Text>
      {closeable && (
        <View
          onClick={handleClose}
          style={{
            marginLeft: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Close size={14} color={selected ? "white" : "#999"} />
        </View>
      )}
    </View>
  );
};

const LedgerEntries = ({ entries = [], onEntryTap, users = [] }) => {
  const [filteredEntries, setFilteredEntries] = useState(entries);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Filter states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start");

  // Extracted categories from entries
  const [categories, setCategories] = useState([]);

  // Update filtered entries when entries change or filters change
  useEffect(() => {
    applyFilters();
  }, [entries, selectedUsers, dateRange, selectedCategories]);

  // Extract unique categories from entries
  useEffect(() => {
    if (entries && entries.length > 0) {
      const uniqueCategories = [
        ...new Set(entries.map((entry) => entry.category)),
      ].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [entries]);

  // Apply all filters to entries
  const applyFilters = () => {
    let result = [...entries];

    // Apply user filter
    if (selectedUsers.length > 0) {
      result = result.filter((entry) => selectedUsers.includes(entry.userId));
    }

    // Apply date range filter
    if (dateRange.start) {
      result = result.filter(
        (entry) => new Date(entry.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      result = result.filter(
        (entry) => new Date(entry.date) <= new Date(dateRange.end)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((entry) =>
        selectedCategories.includes(entry.category)
      );
    }

    setFilteredEntries(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedUsers([]);
    setDateRange({ start: "", end: "" });
    setSelectedCategories([]);
    setShowFilterPopup(false);
  };

  // Handle date picker
  const openDatePicker = (type) => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const handleDateConfirm = (dateArray) => {
    const year = dateArray[0].value;
    const month = dateArray[1].value;
    const day = dateArray[2].value;

    const formattedDate = `${year}-${month}-${day}`;

    if (datePickerType === "start") {
      setDateRange({ ...dateRange, start: formattedDate });
    } else {
      setDateRange({ ...dateRange, end: formattedDate });
    }

    setShowDatePicker(false);
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Group entries by date
  const groupEntriesByDate = (entries) => {
    if (!entries || entries.length === 0) return [];

    const groups = {};
    entries.forEach((entry) => {
      // Create a date object and ensure it uses local timezone
      let date = new Date(entry.date);
      // Format the date in YYYY-MM-DD format in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(entry);
    });

    // Convert to array of { date, entries, totalAmount } objects
    return Object.keys(groups).map((date) => {
      // Calculate total income and expense amounts for this date's entries
      const { income, expense } = groups[date].reduce(
        (acc, entry) => {
          const amount = parseFloat(entry.amount) || 0;
          if (entry.type === "income") {
            acc.income += amount;
          } else if (entry.type === "expense") {
            acc.expense += amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );

      return {
        date,
        relativeDate: getRelativeTimeDesc(date),
        entries: groups[date],
        income: income.toFixed(2),
        expense: expense.toFixed(2),
      };
    });
  };

  return (
    <View className="ledger-entries-component">
      {/* Filter button */}
      <View className="ledger-entries-filter-bar">
        <View className="ledger-entries-filter-header">
          <View
            className="ledger-entries-filter-button"
            onClick={() => setShowFilterPopup(true)}
          >
            <Filter size={16} />
            <Text>筛选记录</Text>
            <ArrowDown size={12} className="filter-arrow-icon" />
          </View>

          {entries.length > 0 && (
            <View className="ledger-entries-result-count">
              {filteredEntries.length === entries.length ? (
                <Text>共 {entries.length} 笔记录</Text>
              ) : (
                <Text>
                  筛选出 {filteredEntries.length}/{entries.length} 笔记录
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Active filter chips */}
        {(selectedUsers.length > 0 ||
          dateRange.start ||
          dateRange.end ||
          selectedCategories.length > 0) && (
          <View className="ledger-entries-active-filters">
            {selectedUsers.length > 0 &&
              selectedUsers.map((userId) => {
                const user = users.find((u) => u.userId === userId);
                return (
                  user && (
                    <CustomTag
                      key={userId}
                      selected={true}
                      closeable
                      onClose={() =>
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== userId)
                        )
                      }
                    >
                      {user.username || "用户"}
                    </CustomTag>
                  )
                );
              })}

            {dateRange.start && (
              <CustomTag
                selected={true}
                closeable
                onClose={() => setDateRange({ ...dateRange, start: "" })}
              >
                从 {dateRange.start}
              </CustomTag>
            )}

            {dateRange.end && (
              <CustomTag
                selected={true}
                closeable
                onClose={() => setDateRange({ ...dateRange, end: "" })}
              >
                至 {dateRange.end}
              </CustomTag>
            )}

            {selectedCategories.map((category) => (
              <CustomTag
                key={category}
                selected={true}
                closeable
                onClose={() => toggleCategory(category)}
              >
                {category}
              </CustomTag>
            ))}

            {/* Reset all filters button */}
            <Text className="reset-all-filters" onClick={resetFilters}>
              清除全部
            </Text>
          </View>
        )}
      </View>

      {/* Entries list */}
      {filteredEntries.length > 0 ? (
        groupEntriesByDate(filteredEntries).map((group) => (
          <View className="ledger-entries-group" key={group.date}>
            <View className="ledger-entries-group__header">
              <Text className="ledger-entries-group__date">
                {group.relativeDate}
              </Text>
              <View className="ledger-entries-group__totals">
                {parseFloat(group.income) > 0 && (
                  <Text>收入 ¥{group.income}</Text>
                )}
                {parseFloat(group.expense) > 0 && (
                  <Text>支出 ¥{group.expense}</Text>
                )}
              </View>
            </View>
            {group.entries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} onTap={onEntryTap} />
            ))}
          </View>
        ))
      ) : (
        <Empty description="无符合条件的记账记录" />
      )}

      {/* Filter popup */}
      <Popup
        visible={showFilterPopup}
        position="bottom"
        round
        onClose={() => setShowFilterPopup(false)}
        style={{ height: "70%" }}
      >
        <ScrollView scrollY style={{ height: "100%" }}>
          <View className="ledger-entries-filter-popup">
            <View className="ledger-entries-filter-popup__header">
              <Text className="ledger-entries-filter-popup__title">
                筛选记录
              </Text>
              <Text
                className="ledger-entries-filter-popup__reset"
                onClick={resetFilters}
              >
                重置
              </Text>
            </View>

            {/* User filter */}
            {users.length > 0 && (
              <View className="ledger-entries-filter-section">
                <Text className="ledger-entries-filter-section__title">
                  按用户筛选
                </Text>
                <View className="ledger-entries-filter-section__content">
                  <View className="ledger-entries-filter-tags">
                    {users.map((user) => (
                      <CustomTag
                        key={user.userId}
                        selected={selectedUsers.includes(user.userId)}
                        onClick={() => {
                          if (selectedUsers.includes(user.userId)) {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user.userId)
                            );
                          } else {
                            setSelectedUsers([...selectedUsers, user.userId]);
                          }
                        }}
                      >
                        {user.username}
                      </CustomTag>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Date filter */}
            <View className="ledger-entries-filter-section">
              <Text className="ledger-entries-filter-section__title">
                按日期筛选
              </Text>
              <View className="ledger-entries-filter-section__content">
                <View className="ledger-entries-date-range">
                  <View
                    className="ledger-entries-date-picker-trigger"
                    onClick={() => openDatePicker("start")}
                  >
                    <Text>{dateRange.start || "开始日期"}</Text>
                  </View>
                  <Text className="date-range-separator">至</Text>
                  <View
                    className="ledger-entries-date-picker-trigger"
                    onClick={() => openDatePicker("end")}
                  >
                    <Text>{dateRange.end || "结束日期"}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Category filter */}
            {categories.length > 0 && (
              <View className="ledger-entries-filter-section">
                <Text className="ledger-entries-filter-section__title">
                  按分类筛选
                </Text>
                <View className="ledger-entries-filter-section__content">
                  <View className="ledger-entries-filter-tags">
                    {categories.map((category) => (
                      <CustomTag
                        key={category}
                        selected={selectedCategories.includes(category)}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </CustomTag>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <Button
              type="primary"
              block
              onClick={() => setShowFilterPopup(false)}
            >
              应用筛选
            </Button>
          </View>
        </ScrollView>
      </Popup>

      {/* Date picker popup */}
      <DatePicker
        visible={showDatePicker}
        title={datePickerType === "start" ? "选择开始日期" : "选择结束日期"}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        defaultValue={useDatePicker(new Date())}
      />
    </View>
  );
};

export default LedgerEntries;
