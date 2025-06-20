import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Input, Button, Tabs } from "@nutui/nutui-react-taro";
import { inviteService, ledgerService } from "../../../services";
import CustomTag from "../../../components/CustomTag";
import "./index.less";

const CreateLedger = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  // Predefined ledger name suggestions
  const nameOptions = [
    "家庭账本",
    "日常账本",
    "旅行账本",
    "购物账本",
    "投资账本",
  ];

  const handleNameChange = (value) => {
    console.log("nameChange", value);
    setName(value);
  };

  const handleDescriptionChange = (value) => {
    console.log("descriptionChange", value);
    setDescription(value);
  };

  const handleInviteCodeChange = (value) => {
    console.log("inviteCodeChange", value);
    setInviteCode(value);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Apply tag text as name
  const handleTagClick = (tagName) => {
    setName(tagName);
  };

  // Submit form
  const handleSubmit = async () => {
    if (activeTab === "create") {
      // Handle create ledger
      // Validate form
      if (!name.trim()) {
        Taro.showToast({ title: "请输入账本名称", icon: "none" });
        return;
      }

      setLoading(true);
      try {
        await ledgerService.createLedger({
          name,
          description,
        });

        Taro.showToast({
          title: "创建成功",
          icon: "success",
        });

        // Navigate back
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } catch (error) {
        console.error("Error creating ledger:", error);
        Taro.showToast({
          title: "创建失败，请重试",
          icon: "none",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Handle join ledger
      if (!inviteCode.trim()) {
        Taro.showToast({ title: "请输入邀请码", icon: "none" });
        return;
      }

      setLoading(true);
      try {
        await inviteService.joinByCode(inviteCode);

        Taro.showToast({
          title: "加入成功",
          icon: "success",
        });

        // Navigate back
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } catch (error) {
        console.error("Error joining ledger:", error);
        Taro.showToast({
          title: "加入失败，请检查邀请码是否正确",
          icon: "none",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="create-ledger-page">
      <View className="create-ledger-header">
        <Text className="create-ledger-header__title">
          {activeTab === "create" ? "创建账本" : "加入账本"}
        </Text>
      </View>

      <View className="ledger-tabs">
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.TabPane title="创建账本" value="create" />
          <Tabs.TabPane title="加入账本" value="join" />
        </Tabs>
      </View>

      <View className="create-ledger-form">
        {activeTab === "create" ? (
          <View>
            <View className="form-item">
              <View className="form-item__label">账本名称</View>
              <Input
                placeholder="请输入账本名称"
                value={name}
                onChange={handleNameChange}
                maxLength={20}
              />
              <View className="name-suggestions">
                {nameOptions.map((option, index) => (
                  <CustomTag key={index} onClick={() => handleTagClick(option)}>
                    {option}
                  </CustomTag>
                ))}
              </View>
            </View>

            <View className="form-item">
              <View className="form-item__label">账本描述</View>
              <Input
                placeholder="请输入账本描述（选填）"
                maxLength={40}
                value={description}
                onChange={handleDescriptionChange}
              />
            </View>
          </View>
        ) : (
          <View>
            <View className="form-item">
              <View className="form-item__label">邀请码</View>
              <Input
                placeholder="请输入账本邀请码"
                value={inviteCode}
                onChange={handleInviteCodeChange}
                maxLength={20}
              />
            </View>
          </View>
        )}
      </View>

      <View className="create-ledger-submit">
        <Button type="primary" block loading={loading} onClick={handleSubmit}>
          {activeTab === "create" ? "创建账本" : "加入账本"}
        </Button>
      </View>
    </View>
  );
};

export default CreateLedger;
