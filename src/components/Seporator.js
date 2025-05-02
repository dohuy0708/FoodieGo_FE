import React from "react";
import { View } from "react-native";

const Separator = ({ height, width }) => <View style={{ height, width }} />;

Separator.defaultProps = {
  height: 0,
  width: 0,
};

export default Separator;
