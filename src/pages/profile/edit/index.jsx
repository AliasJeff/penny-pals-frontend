import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { Input, Button, Avatar } from "@nutui/nutui-react-taro";
import { userService } from "../../../services";
import "./index.less";

const EditProfile = () => {
  const [form, setForm] = useState({
    id: "",
    username: "",
    avatar: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Fetch user data when page shows
  useDidShow(() => {
    fetchUserData();
  });

  // Fetch current user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setForm({
        id: userData.id || "",
        username: userData.username || "",
        avatar: userData.avatar || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
      });

      if (userData.avatar) {
        setFileList([
          { url: userData.avatar, status: "success", message: "Avatar" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Taro.showToast({
        title: "加载用户数据失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update form field value
  const handleInputChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleSubmit = async () => {
    if (!form.username.trim()) {
      Taro.showToast({
        title: "用户名不能为空",
        icon: "none",
      });
      return;
    }

    setSubmitting(true);
    try {
      await userService.updateUser(form);
      Taro.showToast({
        title: "保存成功",
        icon: "success",
      });
      // Navigate back after successful update
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      Taro.showToast({
        title: "保存失败，请重试",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="edit-profile-page">
      {/* Avatar Upload Section */}
      <View className="avatar-section">
        <Text className="section-title">头像</Text>
        <View className="avatar-uploader">
          {form.avatar ? (
            <Image className="avatar-preview" src={form.avatar} />
          ) : (
            <Avatar
              size="large"
              background="#4670FF"
              color="#FFFFFF"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              {form.username?.substring(0, 1) || "用"}
            </Avatar>
          )}
          {/* <Button
            openType="chooseAvatar"
            onChooseAvatar={(e) => console.log(e)}
          >
            选择头像
          </Button> */}
        </View>
      </View>

      {/* Input Fields */}
      <View className="input-section">
        {/* Username Section */}
        <View className="input-field">
          <Text className="input-label">
            用户名 <Text className="required">*</Text>
          </Text>
          <Input
            className="input-control"
            placeholder="请输入用户名"
            value={form.username}
            onChange={(val) => handleInputChange("username", val)}
          />
        </View>

        {/* Email Section */}
        <View className="input-field">
          <Text className="input-label">邮箱</Text>
          <Input
            className="input-control"
            type="email"
            placeholder="请输入邮箱"
            value={form.email}
            onChange={(val) => handleInputChange("email", val)}
          />
        </View>

        {/* phoneNumber Section */}
        <View className="input-field">
          <Text className="input-label">手机号码</Text>
          <Input
            className="input-control"
            type="tel"
            placeholder="请输入手机号码"
            value={form.phoneNumber}
            onChange={(val) => handleInputChange("phoneNumber", val)}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="action-buttons">
        <Button
          className="cancel-button"
          type="default"
          // onClick={() => Taro.navigateBack()}
          onClick={() =>
            Taro.getUserProfile({
              desc: "获取用户信息",
              success: (res) => {
                console.log(res);
              },
              fail: (err) => {
                console.log("getUserProfile fail");
                console.log(err);
              },
            })
          }
        >
          取消
        </Button>
        <Button
          className="save-button"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </View>
    </View>
  );
};

export default EditProfile;
