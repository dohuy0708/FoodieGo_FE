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
import {
  createReview,
  deleteReview,
  uploadImageToServer,
} from "../../services/reviewService";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AlertModal from "../../components/AlertModal";

const FeedbackScreen = ({ navigation, route }) => {
  const { order } = route.params;
  const hasFeedback = Array.isArray(order?.review) && order.review.length > 0;
  const [rating, setRating] = useState(
    hasFeedback ? order.review[0].rating : 0
  );
  const [comment, setComment] = useState(
    hasFeedback ? order.review[0].content : ""
  );
  const [imageUrl, setImageUrl] = useState(
    hasFeedback ? order.review[0].imageUrl : ""
  );
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState("");

  const selectImage = async () => {
    if (loading) return;
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Cần quyền truy cập",
          "Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [8, 7],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

  // Kiểm tra token trước khi gửi hoặc xóa đánh giá
  const checkTokenOrRedirect = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại.", [
        { text: "OK", onPress: () => navigation.replace("LoginScreen") },
      ]);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hasToken = await checkTokenOrRedirect();
      if (!hasToken) return;
      let finalImageUrl = imageUrl;
      if (selectedImage) {
        const uploadedUrl = await uploadImageToServer(selectedImage);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl.split(" ")[0];
        }
      }
      await createReview(rating, comment, finalImageUrl, order.id);
      setModalInfo("Đánh giá thành công!");
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();
      }, 1200);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unauthorized")) {
        Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại.", [
          { text: "OK", onPress: () => navigation.replace("LoginScreen") },
        ]);
      } else {
        alert("Lỗi khi gửi đánh giá: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const hasToken = await checkTokenOrRedirect();
      if (!hasToken) return;
      await deleteReview(order.review[0].id);
      setModalInfo("Xóa đánh giá thành công!");
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();
      }, 1200);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unauthorized")) {
        Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại.", [
          { text: "OK", onPress: () => navigation.replace("LoginScreen") },
        ]);
      } else {
        alert("Lỗi khi xóa đánh giá: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Đánh giá" onBackPress={() => navigation.goBack()} />
        <ScrollView>
          <View style={styles.store}>
            <Ionicons style={styles.icon} name="storefront-outline" size={22} />
            <Text style={styles.storeName}>{order?.restaurant?.name}</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.orderIdText}>Mã đơn hàng: {order?.id}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.card}>
            <View style={styles.foodInfo}>
              <Image
                source={{ uri: order?.orderDetail?.[0]?.menu?.imageUrl }}
                style={styles.foodImage}
              />
              <Text style={styles.foodText}>
                {order?.orderDetail?.[0]?.quantity} x{" "}
                {order?.orderDetail?.[0]?.menu?.name}
              </Text>
            </View>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => !hasFeedback && setRating(i + 1)}
                  disabled={hasFeedback}
                >
                  <Ionicons
                    name={i < rating ? "star" : "star-outline"}
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
              placeholder="Nhập đánh giá của bạn..."
              multil
              value={comment}
              onChangeText={setComment}
              editable={!hasFeedback}
            />
            {/* Icon thêm ảnh */}
            {!hasFeedback && (
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={selectImage}
              >
                <Ionicons name="camera-outline" size={30} color="#666" />
                <Ionicons
                  name="add-circle"
                  size={16}
                  color="#666"
                  style={{ position: "absolute", bottom: -5, right: -5 }}
                />
                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={{
                      position: "absolute",
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </TouchableOpacity>
            )}
            <View style={styles.divider} />
          </View>
          {!hasFeedback ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#e74c3c" }]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Đang xóa..." : "Xóa đánh giá"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <AlertModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            navigation.goBack();
          }}
          info={modalInfo}
        />
      </View>
    </SafeAreaView>
  );
};

export default FeedbackScreen;

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
  orderIdText: {
    fontWeight: "bold",
    color: "#008080",
    fontSize: 13,
    // marginLeft: 10, // bỏ marginLeft nếu căn phải
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
