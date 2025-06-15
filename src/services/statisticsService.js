import { post } from "./request";
import { formatDate } from "../utils/dateUtils";
import { getCategoryIcon } from "../utils/categoryUtils";

/**
 * Statistics related API services
 */
export default {
  /**
   * Get statistics data
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date
   * @param {string} params.endDate - End date
   * @param {string} params.type - Type of statistics to fetch ('expense' or 'income')
   * @param {string} params.period - Period type ('week', 'month', 'year')
   */
  getStatistics: async (params) => {
    try {
      // This is a client-side statistics implementation
      // In future this could be replaced with a server API call

      // Fetch entries for the date range
      const response = await post("/api/entry/my/list", {
        startDate: params.startDate,
        endDate: params.endDate,
        orderBy: "date",
        orderDirection: params.orderDirection || "asc",
      });

      return processStatistics(response, params);
    } catch (error) {
      console.error("Statistics error:", error);
      throw error;
    }
  },

  /**
   * Process raw entries into daily statistics
   * @param {Array} entries - Raw entries from API
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} type - Type of statistics ('expense' or 'income')
   */
  processEntries: (entries, startDate, endDate, type = "expense") => {
    return processStatistics(entries, {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      type,
    });
  },
};

/**
 * Process raw entries into statistics data
 * @param {Array} entries - Raw entries from API
 * @param {Object} params - Parameters
 * @param {string} params.startDate - Start date string (YYYY-MM-DD)
 * @param {string} params.endDate - End date string (YYYY-MM-DD)
 * @param {string} params.type - Type of statistics ('expense' or 'income')
 * @returns {Object} Processed statistics
 */
const processStatistics = (entries = [], params = {}) => {
  const { startDate, endDate, type = "expense" } = params;
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Filter by transaction type
  const filteredEntries = entries.filter((entry) => entry.type === type);

  if (type === "expense") {
    // Calculate totals for expenses
    const totalExpense = filteredEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    // Process daily expenses
    const dailyExpenses = processDailyEntries(filteredEntries, start, end);

    // Calculate average expense per day with data
    const daysWithData = dailyExpenses.filter((day) => day.amount > 0).length;
    const averageExpense = daysWithData > 0 ? totalExpense / daysWithData : 0;

    // Process categories
    const categoryRanking = processCategoryRanking(filteredEntries);

    return {
      totalExpense,
      averageExpense,
      dailyExpenses,
      categoryRanking,
    };
  } else {
    // Calculate totals for income
    const totalIncome = filteredEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    // Process daily income
    const dailyIncomes = processDailyEntries(filteredEntries, start, end);

    // Calculate average income per day with data
    const daysWithData = dailyIncomes.filter((day) => day.amount > 0).length;
    const averageIncome = daysWithData > 0 ? totalIncome / daysWithData : 0;

    // Process categories for income
    const categoryRanking = processCategoryRanking(filteredEntries);

    return {
      totalIncome,
      averageIncome,
      dailyIncomes,
      categoryRanking,
    };
  }
};

/**
 * Process daily entries for chart
 */
const processDailyEntries = (entries, startDate, endDate) => {
  const dailyMap = {};
  const result = [];

  // Create map of dates
  let current = new Date(startDate);
  while (current <= endDate) {
    const dateKey = formatDate(current);
    dailyMap[dateKey] = {
      date: dateKey,
      amount: 0,
      label: `${current.getMonth() + 1}-${current.getDate()}`,
    };
    current.setDate(current.getDate() + 1);
  }

  // Sum up entries by date
  entries.forEach((entry) => {
    const dateKey = entry.date ? formatDate(new Date(entry.date)) : null;
    if (dateKey && dailyMap[dateKey]) {
      dailyMap[dateKey].amount += entry.amount;
    }
  });

  // Convert map to array
  Object.values(dailyMap).forEach((day) => {
    result.push(day);
  });

  return result;
};

/**
 * Process category ranking
 */
const processCategoryRanking = (entries) => {
  const categoryMap = {};
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  // Group entries by category
  entries.forEach((entry) => {
    const category = entry.category || "未分类";
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        amount: 0,
        count: 0,
      };
    }

    categoryMap[category].amount += entry.amount;
    categoryMap[category].count += 1;
  });

  // Calculate percentages and sort by amount
  const categories = Object.values(categoryMap).map((cat) => ({
    ...cat,
    percentage: total > 0 ? (cat.amount / total) * 100 : 0,
  }));

  return categories.sort((a, b) => b.amount - a.amount);
};
