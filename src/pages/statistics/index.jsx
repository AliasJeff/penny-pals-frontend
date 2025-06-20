import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro, { usePullDownRefresh, useDidShow } from "@tarojs/taro";
import { Tabs, Skeleton } from "@nutui/nutui-react-taro";
import { entryService } from "../../services";
import statisticsService from "../../services/statisticsService";
import { formatDate } from "../../utils/dateUtils";
import { getCategoryIcon } from "../../utils/categoryUtils";
import LineChart from "../../components/charts/LineChart";
import "./index.less";

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("week"); // "week", "month", "year"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalExpense, setTotalExpense] = useState(0);
  const [averageExpense, setAverageExpense] = useState(0);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [categoryRanking, setCategoryRanking] = useState([]);
  const [periodTabs, setPeriodTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(4); // Default to current period (index 4)
  const [viewMode, setViewMode] = useState("expense"); // "expense" or "income"
  const [totalIncome, setTotalIncome] = useState(0);
  const [averageIncome, setAverageIncome] = useState(0);
  const [dailyIncomes, setDailyIncomes] = useState([]);
  const [incomeRanking, setIncomeRanking] = useState([]);

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

  // Update data when period or tab changes
  useEffect(() => {
    if (period && activeTab !== undefined) {
      updateDateRange();
    }
  }, [period, activeTab, viewMode]);

  // Update period tabs when period changes
  useEffect(() => {
    generatePeriodTabs();
  }, [period, currentDate]);

  // Generate period tabs based on current period type
  const generatePeriodTabs = () => {
    const tabs = [];
    const now = new Date();

    if (period === "week") {
      // Generate 5 weeks: 4 previous weeks and current week
      for (let i = -4; i <= 0; i++) {
        const weekDate = new Date(now);
        weekDate.setDate(now.getDate() + i * 7);
        const weekNum = getWeekNumber(weekDate);
        tabs.push({
          label: i === 0 ? "本周" : i === -1 ? "上周" : `${weekNum}周`,
          value: i + 4, // Index 0-4, with 4 being current week
        });
      }
    } else if (period === "month") {
      // Generate 5 months: 4 previous months and current month
      for (let i = -4; i <= 0; i++) {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() + i);
        tabs.push({
          label:
            i === 0
              ? "本月"
              : i === -1
              ? "上月"
              : `${monthDate.getMonth() + 1}月`,
          value: i + 4, // Index 0-4, with 4 being current month
        });
      }
    } else if (period === "year") {
      // Generate 5 years: 4 previous years and current year
      for (let i = -4; i <= 0; i++) {
        const yearDate = new Date(now);
        yearDate.setFullYear(now.getFullYear() + i);
        tabs.push({
          label:
            i === 0
              ? "本年"
              : i === -1
              ? "上年"
              : `${yearDate.getFullYear()}年`,
          value: i + 4, // Index 0-4, with 4 being current year
        });
      }
    }

    setPeriodTabs(tabs);
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    );
  };

  // Update date range based on period and selected tab
  const updateDateRange = () => {
    const now = new Date();
    const offset = activeTab - 4; // Normalize to -4, -3, -2, -1, 0
    let startDate, endDate;

    if (period === "week") {
      // Calculate start of week (Monday) and end of week (Sunday)
      const currentDayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDayOfWeek + 1 + offset * 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      startDate = startOfWeek;
      endDate = endOfWeek;
    } else if (period === "month") {
      // Calculate start and end of month
      const targetMonth = now.getMonth() + offset;
      const targetYear =
        now.getFullYear() + Math.floor((now.getMonth() + offset) / 12);
      const normalizedMonth = ((targetMonth % 12) + 12) % 12;

      startDate = new Date(targetYear, normalizedMonth, 1);
      endDate = new Date(targetYear, normalizedMonth + 1, 0); // Last day of month
    } else if (period === "year") {
      // Calculate start and end of year
      const targetYear = now.getFullYear() + offset;

      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31);
    }

    setCurrentDate(new Date(startDate));
    loadStatisticsData(startDate, endDate);
  };

  // Function to load statistics data
  const loadStatisticsData = async (start, end) => {
    if (!refreshing) setLoading(true);
    const startDate = start || currentDate;
    const endDate = end || new Date(startDate);

    if (period === "week") {
      // If no explicit end date, set to end of week
      if (!end) endDate.setDate(startDate.getDate() + 6);
    } else if (period === "month") {
      // If no explicit end date, set to end of month
      if (!end) endDate.setMonth(startDate.getMonth() + 1, 0);
    } else if (period === "year") {
      // If no explicit end date, set to end of year
      if (!end) endDate.setFullYear(startDate.getFullYear(), 11, 31);
    }

    try {
      // Get statistics based on the view mode
      const params = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        period: period,
        type: viewMode, // Pass viewMode to distinguish between expense and income
      };

      const stats = await statisticsService.getStatistics(params);

      if (viewMode === "expense") {
        setTotalExpense(stats.totalExpense);
        setAverageExpense(stats.averageExpense);

        // Format daily expenses based on period
        if (period === "year") {
          // For year view, ensure data is aggregated by month
          if (stats.monthlyExpenses) {
            // If backend provides monthly data directly
            setDailyExpenses(
              stats.monthlyExpenses.map((month) => ({
                label: `${month.month}月`,
                amount: month.amount,
              }))
            );
          } else {
            // If we need to transform daily data to monthly
            const monthlyData = aggregateDataByMonth(
              stats.dailyExpenses,
              startDate.getFullYear()
            );
            setDailyExpenses(monthlyData);
          }
        } else {
          // For week and month views, use daily data as is
          setDailyExpenses(stats.dailyExpenses);
        }

        setCategoryRanking(stats.categoryRanking);
      } else {
        setTotalIncome(stats.totalIncome);
        setAverageIncome(stats.averageIncome);

        // Format daily incomes based on period
        if (period === "year") {
          // For year view, ensure data is aggregated by month
          if (stats.monthlyIncomes) {
            // If backend provides monthly data directly
            setDailyIncomes(
              stats.monthlyIncomes.map((month) => ({
                label: `${month.month}月`,
                amount: month.amount,
              }))
            );
          } else {
            // If we need to transform daily data to monthly
            const monthlyData = aggregateDataByMonth(
              stats.dailyIncomes,
              startDate.getFullYear()
            );
            setDailyIncomes(monthlyData);
          }
        } else {
          // For week and month views, use daily data as is
          setDailyIncomes(stats.dailyIncomes);
        }

        setIncomeRanking(stats.categoryRanking);
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
      Taro.showToast({
        title: `加载${viewMode === "expense" ? "支出" : "收入"}统计数据失败`,
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to aggregate daily data into monthly data
  const aggregateDataByMonth = (dailyData, year) => {
    // Create an array for 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}月`,
      amount: 0,
      month: i + 1,
    }));

    // Sum up daily amounts by month
    dailyData.forEach((day) => {
      const date = new Date(day.date);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        monthlyData[month].amount += day.amount;
      }
    });

    return monthlyData;
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <View className="statistics-skeleton">
      <Skeleton rows={1} title animated />
      <Skeleton rows={3} animated />
      <Skeleton rows={5} animated />
    </View>
  );

  // Toggle between expense and income view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <View className="statistics-page">
      <View className="statistics-header">
        <View className="view-mode-toggle">
          <Text
            className={`view-mode-option ${
              viewMode === "expense" ? "active" : ""
            }`}
            onClick={() => toggleViewMode("expense")}
          >
            支出
          </Text>
          <Text
            className={`view-mode-option ${
              viewMode === "income" ? "active" : ""
            }`}
            onClick={() => toggleViewMode("income")}
          >
            收入
          </Text>
        </View>
        <View className="period-selector">
          <Text
            className={`period-option ${period === "week" ? "active" : ""}`}
            onClick={() => setPeriod("week")}
          >
            周
          </Text>
          <Text
            className={`period-option ${period === "month" ? "active" : ""}`}
            onClick={() => setPeriod("month")}
          >
            月
          </Text>
          <Text
            className={`period-option ${period === "year" ? "active" : ""}`}
            onClick={() => setPeriod("year")}
          >
            年
          </Text>
        </View>
      </View>

      <View className="period-tabs-container">
        <View className="period-tabs">
          {periodTabs.map((tab) => (
            <Text
              key={tab.value}
              className={`period-tab ${
                activeTab === tab.value ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </Text>
          ))}
        </View>
      </View>

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          <View className="statistics-summary">
            {viewMode === "expense" ? (
              <>
                <View className="statistics-total">
                  <Text className="statistics-label">总支出:</Text>
                  <Text className="statistics-value">
                    {totalExpense.toFixed(2)}
                  </Text>
                </View>
                <View className="statistics-average">
                  <Text className="statistics-label">平均值:</Text>
                  <Text className="statistics-value">
                    {averageExpense.toFixed(2)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="statistics-total">
                  <Text className="statistics-label">总收入:</Text>
                  <Text className="statistics-value statistics-income-value">
                    {totalIncome.toFixed(2)}
                  </Text>
                </View>
                <View className="statistics-average">
                  <Text className="statistics-label">平均值:</Text>
                  <Text className="statistics-value statistics-income-value">
                    {averageIncome.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View className="statistics-chart">
            <LineChart
              dailyExpenses={(viewMode === "expense"
                ? dailyExpenses
                : dailyIncomes
              ).map((item) => ({
                ...item,
                amount: Number(item.amount.toFixed(1)),
              }))}
              style={{ width: "100%", height: "200px" }}
              isIncome={viewMode === "income"}
            />
          </View>

          <View className="statistics-ranking">
            <Text className="ranking-title">
              {viewMode === "expense" ? "支出" : "收入"}排行榜
            </Text>
            <View className="ranking-list">
              {(viewMode === "expense" ? categoryRanking : incomeRanking).map(
                (category, index) => (
                  <View key={index} className="ranking-item">
                    <View className="ranking-item-icon">
                      <Image
                        className="ranking-category-icon"
                        src={getCategoryIcon(category.category)}
                        mode="aspectFit"
                      />
                    </View>
                    <View className="ranking-item-info">
                      <View className="ranking-item-top">
                        <Text className="ranking-category-name">
                          {category.category}
                        </Text>
                        <Text className="ranking-category-percent">
                          {category.percentage.toFixed(1)}%
                        </Text>
                      </View>
                      <View className="ranking-progress">
                        <View
                          className={`ranking-progress-bar ${
                            viewMode === "income" ? "income-bar" : ""
                          }`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </View>
                    </View>
                    <Text
                      className={`ranking-item-amount ${
                        viewMode === "income" ? "income-amount" : ""
                      }`}
                    >
                      {category.amount.toFixed(2)}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default Statistics;
