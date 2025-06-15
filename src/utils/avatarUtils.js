// Import all avatar images
import avatar01 from "../assets/icons/avatars/avatar_01.png";
import avatar02 from "../assets/icons/avatars/avatar_02.png";
import avatar03 from "../assets/icons/avatars/avatar_03.png";
import avatar04 from "../assets/icons/avatars/avatar_04.png";
import avatar05 from "../assets/icons/avatars/avatar_05.png";
import avatar06 from "../assets/icons/avatars/avatar_06.png";
import avatar08 from "../assets/icons/avatars/avatar_08.png";
import avatar09 from "../assets/icons/avatars/avatar_09.png";
import avatar10 from "../assets/icons/avatars/avatar_10.png";
import avatar11 from "../assets/icons/avatars/avatar_11.png";
import avatar12 from "../assets/icons/avatars/avatar_12.png";
import avatar13 from "../assets/icons/avatars/avatar_13.png";
import avatar14 from "../assets/icons/avatars/avatar_14.png";
import avatar15 from "../assets/icons/avatars/avatar_15.png";
import avatar16 from "../assets/icons/avatars/avatar_16.png";
import avatar17 from "../assets/icons/avatars/avatar_17.png";
import avatar18 from "../assets/icons/avatars/avatar_18.png";
import avatar19 from "../assets/icons/avatars/avatar_19.png";
import avatar20 from "../assets/icons/avatars/avatar_20.png";
import avatar21 from "../assets/icons/avatars/avatar_21.png";
import avatar22 from "../assets/icons/avatars/avatar_22.png";

/**
 * Avatar mapping object - maps avatar filenames to their imported images
 */
export const avatarMap = {
  "avatar_01.png": avatar01,
  "avatar_02.png": avatar02,
  "avatar_03.png": avatar03,
  "avatar_04.png": avatar04,
  "avatar_05.png": avatar05,
  "avatar_06.png": avatar06,
  "avatar_08.png": avatar08,
  "avatar_09.png": avatar09,
  "avatar_10.png": avatar10,
  "avatar_11.png": avatar11,
  "avatar_12.png": avatar12,
  "avatar_13.png": avatar13,
  "avatar_14.png": avatar14,
  "avatar_15.png": avatar15,
  "avatar_16.png": avatar16,
  "avatar_17.png": avatar17,
  "avatar_18.png": avatar18,
  "avatar_19.png": avatar19,
  "avatar_20.png": avatar20,
  "avatar_21.png": avatar21,
  "avatar_22.png": avatar22,
};

/**
 * Avatar options array for selection UI
 */
export const avatarOptions = [
  { id: "avatar_01.png", src: avatar01 },
  { id: "avatar_02.png", src: avatar02 },
  { id: "avatar_03.png", src: avatar03 },
  { id: "avatar_04.png", src: avatar04 },
  { id: "avatar_05.png", src: avatar05 },
  { id: "avatar_06.png", src: avatar06 },
  { id: "avatar_08.png", src: avatar08 },
  { id: "avatar_09.png", src: avatar09 },
  { id: "avatar_10.png", src: avatar10 },
  { id: "avatar_11.png", src: avatar11 },
  { id: "avatar_12.png", src: avatar12 },
  { id: "avatar_13.png", src: avatar13 },
  { id: "avatar_14.png", src: avatar14 },
  { id: "avatar_15.png", src: avatar15 },
  { id: "avatar_16.png", src: avatar16 },
  { id: "avatar_17.png", src: avatar17 },
  { id: "avatar_18.png", src: avatar18 },
  { id: "avatar_19.png", src: avatar19 },
  { id: "avatar_20.png", src: avatar20 },
  { id: "avatar_21.png", src: avatar21 },
  { id: "avatar_22.png", src: avatar22 },
];

/**
 * Get avatar source based on avatar filename
 * @param {string} avatarFilename - The filename of the avatar (e.g. "avatar_01.png")
 * @returns {string|null} - The source URL of the avatar image, or null if not found
 */
export const getAvatarSrc = (avatarFilename) => {
  return avatarMap[avatarFilename] || null;
};
