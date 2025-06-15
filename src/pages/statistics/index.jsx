import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { usePullDownRefresh, useDidShow } from "@tarojs/taro";
import { Calendar } from "@nutui/nutui-react-taro";
import "./index.less";

const Statistics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)), // First day of current month
    endDate: new Date(),
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statisticsData, setStatisticsData] = useState(null);

  // Load statistics data when page shows
  useDidShow(() => {
    loadStatisticsData();
  });

  // Handle pull-down refresh
  usePullDownRefresh(() => {
    setRefreshing(true);
    loadStatisticsData().finally(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    });
  });

  // Function to load statistics data
  const loadStatisticsData = async () => {
    if (!refreshing) setLoading(true);
    try {
      // 这里应该从后端获取统计数据
      // 目前只是示例，实际需要根据API实现
      await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟加载延迟

      // 此处应该是实际的API调用
      // const data = await statisticsService.getStatistics({
      //   startDate: formatDate(dateRange.startDate),
      //   endDate: formatDate(dateRange.endDate)
      // });

      // 设置统计数据
      setStatisticsData({
        // 未来实际统计数据
        inProgress: true,
      });
    } catch (error) {
      console.error("Failed to load statistics:", error);
      Taro.showToast({
        title: "加载统计数据失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Get display text for current date range
  const getDateRangeText = () => {
    const sameYear =
      dateRange.startDate.getFullYear() === dateRange.endDate.getFullYear();
    const sameMonth =
      dateRange.startDate.getMonth() === dateRange.endDate.getMonth();

    if (sameYear && sameMonth) {
      return `${dateRange.startDate.getFullYear()}年${
        dateRange.startDate.getMonth() + 1
      }月`;
    }

    return `${formatDate(dateRange.startDate)} 至 ${formatDate(
      dateRange.endDate
    )}`;
  };

  // Handle calendar date selection
  const handleCalendarSelect = (date) => {
    setShowCalendar(false);
    setDateRange({
      startDate: new Date(date[0]),
      endDate: new Date(date[1]),
    });
    // 日期变更后重新加载统计数据
    loadStatisticsData();
  };

  return (
    <View className="statistics-page">
      <View className="statistics-header">
        <Text className="statistics-header__title">统计报表</Text>
      </View>

      {/* Date Range Selector */}
      <View
        className="statistics-date-range"
        onClick={() => setShowCalendar(true)}
      >
        <Text className="statistics-date-range__text">
          {getDateRangeText()}
        </Text>
      </View>

      {/* Placeholder for Statistics */}
      <View className="statistics-placeholder">
        <View className="statistics-placeholder__icon">📈</View>
        <Text className="statistics-placeholder__text">统计功能正在开发中</Text>
        <Text className="statistics-placeholder__subtext">敬请期待</Text>
      </View>

      {/* Date Range Calendar Popup */}
      <Calendar
        visible={showCalendar}
        type="range"
        startDate={formatDate(dateRange.startDate)}
        endDate={formatDate(dateRange.endDate)}
        onClose={() => setShowCalendar(false)}
        onConfirm={(date) => handleCalendarSelect(date)}
      />
    </View>
  );
};

export default Statistics;
