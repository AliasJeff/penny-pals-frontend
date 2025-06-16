import React from "react";
import { View, Text } from "@tarojs/components";
import { Close } from "@nutui/icons-react-taro";
import "./index.less";

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
    >
      <Text>{children}</Text>
      {closeable && (
        <View onClick={handleClose} className="custom-tag-close">
          <Close size={14} color={selected ? "white" : "#999"} />
        </View>
      )}
    </View>
  );
};

export default CustomTag;
