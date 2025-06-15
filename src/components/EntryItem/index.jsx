import React from "react";
import { View, Text, Image } from "@tarojs/components";
import { formatDate } from "../../utils/dateUtils";
import { getCategoryIcon } from "../../utils/categoryUtils";
import "./index.less";
import Taro from "@tarojs/taro";

const EntryItem = ({ entry, onTap, onChange }) => {
  const { id, amount, category, type, note, date, icon, username } = entry;

  const currentUser = Taro.getStorageSync("currentUser");

  // Format amount for display with appropriate sign
  const formatAmount = () => {
    const absAmount = Math.abs(amount).toFixed(2);
    if (type === "expense") {
      return `-${absAmount}`;
    } else if (type === "income") {
      return `+${absAmount}`;
    }
    return absAmount;
  };

  // Handle tap on entry item
  const handleTap = () => {
    if (onTap) {
      onTap(entry);
    }
  };

  // Determine amount color based on type
  const getAmountColor = () => {
    switch (type) {
      case "expense":
        return "entry-item__amount--expense";
      case "income":
        return "entry-item__amount--income";
      default:
        return "";
    }
  };

  // Get the appropriate category icon
  const categoryIcon = getCategoryIcon(category);

  return (
    <View className="entry-item" onClick={handleTap}>
      <View className="entry-item__icon-container">
        <Image
          className="entry-item__icon-image"
          src={categoryIcon}
          mode="aspectFit"
        />
      </View>

      <View className="entry-item__content">
        <View className="entry-item__left">
          <Text className="entry-item__category">
            {category}
            {note && <Text className="entry-item__note"> - {note}</Text>}
          </Text>
          <Text className="entry-item__user">
            @{username === currentUser?.username ? "我" : username}
          </Text>
        </View>
        <View className="entry-item__right">
          <Text className={`entry-item__amount ${getAmountColor()}`}>
            {formatAmount()}
          </Text>
          <Text
            className="entry-item__date"
            style={!note ? { marginLeft: "auto" } : {}}
          >
            {formatDate(date)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EntryItem;
