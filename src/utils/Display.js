import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

const setHeight = (h) => (height / 100) * h;
const setWidth = (w) => (width / 100) * w;

export default { setHeight, setWidth };

// ví dụ sử dụng
// tabBarStyle: {
//     height: Display.setHeight(8),
//   }

// setHeight(8) // => sẽ trả về 8% chiều cao của màn hình hiện tại
//setWidth(50) // => sẽ trả về 50% chiều rộng của màn hình hiện tại
