import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "react-native/Libraries/NewAppScreen";

const searchHistory = [
  "Matcha đá xay nhầm ánh mắt của em",
  "Sữa chua việt quất",
  "Bún bò kobe",
];

const suggestions = [
  "Bún",
  "Phở",
  "Cơm tấm",
  "Mỳ cay",
  "Trà sữa",
  "Matcha",
  "Gà rán",
  "Caffe muối",
];

const SearchScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={{
            width: "10%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={{ padding: 4 }}>
            <Ionicons name="search" size={20} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            width: "10%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="camera-outline" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        {/* Search History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>Xóa</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {searchHistory.map((item, index) => (
              <Text key={index} style={styles.historyItem}>
                {item}
              </Text>
            ))}
          </ScrollView>
        </View>

        {/* Search Suggestions */}
        <View style={styles.section2}>
          <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  headerContainer: {
    flexDirection: "row",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",

    paddingHorizontal: 10,
    borderRadius: 10,

    width: "80%",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#000",
  },
  sectionContainer: {
    height: "100%",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    height: "30%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  clearText: {
    color: "#999",
  },
  historyItem: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  seeMore: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionItem: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  section2: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginVertical: 8,
    height: "100%",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
});
