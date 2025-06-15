import React from "react";

// Map Chinese categories to English icon file names
const categoryIconMap = {
  // Expenses
  餐饮: "food",
  购物: "shopping",
  日用: "everydayuse",
  交通: "transportation",
  娱乐: "entertainment",
  医疗: "medical",
  住房: "housing",
  通讯: "communication",
  学习: "study",
  烟酒: "wine",
  婴儿: "baby",
  美容: "beauty",
  金融: "finance",
  运动: "sport",
  服装: "clothes",
  快递: "express",
  宠物: "pets",
  数码: "digital",
  旅行: "travel",
  书籍: "books",
  办公: "work",
  红包: "hongbao",
  礼物: "gift",
  其他: "shopping", // Fallback for "other"

  // Income
  工资: "paycheck",
  理财: "finance",
  其他收入: "elseincome",
};

// Get the icon path for a category
export const getCategoryIcon = (category) => {
  const iconName = categoryIconMap[category] || "shopping"; // Default to shopping if no match
  // Use absolute import path for static assets in Taro
  return require(`../assets/icons/entryCategories/${iconName}.png`);
};

// Get all available categories with their icons
export const getAllCategories = () => {
  return Object.keys(categoryIconMap).map((category) => ({
    name: category,
    icon: getCategoryIcon(category),
  }));
};

// Get categories by type (expense or income)
export const getCategoriesByType = (type) => {
  const expenseCategories = [
    "餐饮",
    "购物",
    "日用",
    "交通",
    "娱乐",
    "医疗",
    "住房",
    "通讯",
    "学习",
    "烟酒",
    "婴儿",
    "美容",
    "金融",
    "运动",
    "服装",
    "快递",
    "宠物",
    "数码",
    "旅行",
    "书籍",
    "办公",
    "红包",
    "礼物",
    "其他",
  ];

  const incomeCategories = ["工资", "理财", "其他收入"];

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  return categories.map((category) => ({
    name: category,
    icon: getCategoryIcon(category),
  }));
};
