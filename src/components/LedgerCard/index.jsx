import React from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Avatar } from "@nutui/nutui-react-taro";
import { getAvatarSrc } from "../../utils/avatarUtils";
import "./index.less";

const LedgerCard = ({ ledger, onTap }) => {
  const { id, name, description, icon, entries = [], members = [] } = ledger;

  // Calculate statistics
  const calculateStats = () => {
    let totalExpense = 0;
    let totalIncome = 0;

    if (entries && entries.length > 0) {
      entries.forEach((entry) => {
        if (entry.type === "expense") {
          totalExpense += entry.amount || 0;
        } else if (entry.type === "income") {
          totalIncome += entry.amount || 0;
        }
      });
    }

    return {
      totalExpense,
      totalIncome,
      entryCount: entries.length,
    };
  };

  const stats = calculateStats();

  // Navigate to ledger detail page
  const handleTap = () => {
    if (onTap) {
      onTap(ledger);
    } else {
      Taro.navigateTo({
        url: `/pages/ledgers/detail/index?id=${id}`,
      });
    }
  };

  return (
    <View className="ledger-card" onClick={handleTap}>
      <View className="ledger-card__header">
        {icon ? (
          <Image className="ledger-card__icon" src={icon} mode="aspectFill" />
        ) : (
          <Avatar
            className="ledger-card__avatar"
            background="#4670FF"
            color="#ffffff"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            {name.substring(0, 1).toUpperCase()}
          </Avatar>
        )}
        <View className="ledger-card__info">
          <Text className="ledger-card__name">{name}</Text>
          {description && (
            <Text className="ledger-card__description">{description}</Text>
          )}
        </View>
      </View>

      {/* Stats section */}
      <View className="ledger-card__stats">
        <View className="ledger-card__stats-item">
          <Text className="ledger-card__stats-value">
            ¥{stats.totalExpense.toFixed(2)}
          </Text>
          <Text className="ledger-card__stats-label">支出</Text>
        </View>
        <View className="ledger-card__stats-item">
          <Text className="ledger-card__stats-value">
            ¥{stats.totalIncome.toFixed(2)}
          </Text>
          <Text className="ledger-card__stats-label">收入</Text>
        </View>
        <View className="ledger-card__stats-item">
          <Text className="ledger-card__stats-value">{stats.entryCount}</Text>
          <Text className="ledger-card__stats-label">笔数</Text>
        </View>
      </View>

      {/* Members section */}
      {members && members.length > 0 && (
        <View className="ledger-card__members">
          <Avatar.Group className="ledger-card__members-avatars" max={5}>
            {members.map((member, index) =>
              member.avatar && getAvatarSrc(member.avatar) ? (
                <Avatar
                  key={member.id || index}
                  size="small"
                  className="ledger-card__member-avatar"
                  src={getAvatarSrc(member.avatar)}
                />
              ) : (
                <Avatar
                  key={member.id || index}
                  size="small"
                  className="ledger-card__member-avatar"
                  background={member.role === "owner" ? "#4670FF" : "#6C8EFF"}
                  color="#FFFFFF"
                  style={{ fontSize: 18, fontWeight: 500 }}
                >
                  {member.username?.substring(0, 1) || "..."}
                </Avatar>
              )
            )}
          </Avatar.Group>
        </View>
      )}
    </View>
  );
};

export default LedgerCard;
