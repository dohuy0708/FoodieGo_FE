import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleFoods = [
  {
    id: 1,
    name: "Bún đậu đặc biệt (1 người)",
    quantity: 2,
    image:
      "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
  },
  {
    id: 2,
    name: "Bún đậu đặc biệt (1 người)",
    quantity: 2,
    image:
      "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
  },
];

const HistoryFeedbackScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState(
    sampleFoods.map((item) => ({
      ...item,
      rating: 0,
      comment: "",
      image: null,
    }))
  );

  const handleStarPress = (foodId, starIndex) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === foodId ? { ...item, rating: starIndex + 1 } : item
      )
    );
  };

  const handleCommentChange = (foodId, text) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === foodId ? { ...item, comment: text } : item
      )
    );
  };

  const handleSubmit = () => {
    console.log("Submitting reviews: ", reviews);
    // Gửi về server tại đây nếu cần
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Đánh giá" onBackPress={() => navigation.goBack()} />
        <ScrollView>
          <View style={styles.store}>
            <Ionicons style={styles.icon} name="storefront-outline" size={22} />
            <Text style={styles.storeName}>Bún đậu Akiso - Làng Đại học</Text>
          </View>
          <View style={styles.divider} />

          {reviews.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.foodInfo}>
                <Image
                  source={{
                    uri: "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
                  }}
                  style={styles.foodImage}
                />
                <Text style={styles.foodText}>
                  {item.quantity} x {item.name}
                </Text>
              </View>

              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleStarPress(item.id, i)}
                  >
                    <Ionicons
                      name={i < item.rating ? "star" : "star-outline"}
                      size={24}
                      color="#f1c40f"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.starLabelContainer}>
                <Text style={styles.starLabel}>Đánh giá món ăn này</Text>
              </View>
              <Text style={styles.label}>Viết đánh giá</Text>
              <TextInput
                style={styles.input}
                placeholder="..."
                multiline
                value={item.comment}
                onChangeText={(text) => handleCommentChange(item.id, text)}
              />

              <Text style={styles.label}>Thêm ảnh</Text>
              <TouchableOpacity style={styles.imageUpload}>
                <Ionicons name="camera-outline" size={30} color="#666" />
                <Ionicons
                  name="add-circle"
                  size={16}
                  color="#666"
                  style={{ position: "absolute", bottom: -5, right: -5 }}
                />
              </TouchableOpacity>

              <View style={styles.divider} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HistoryFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  store: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    marginBottom: 24,
  },
  foodInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  foodImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 10,
  },
  foodText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
  },
  starsRow: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },
  starLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },
  starLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  imageUpload: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  submitButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 32,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
