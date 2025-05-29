import React, { useState, useEffect, useCallback } from "react";
import  Colors  from "../../constants/Colors";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import { getMenuById } from "../../services/vendorService";

export default function DishDetail({ navigation, route }) {
  const initialData = route.params?.data;
  const insets = useSafeAreaInsets();

  const [currentDishData, setCurrentDishData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDishDetails = useCallback(async () => {
    if (!initialData?.id) {
      console.error("DishDetail: Missing initial dish ID.");
      setError("Không thể tải dữ liệu chi tiết (thiếu ID).");
      setIsLoading(false);
      return;
    }

    console.log(`Focus: Fetching details for dish ID: ${initialData.id}`);
    setIsLoading(true);
    setError(null);

    try {
      const fetchedData = await getMenuById(initialData.id);

      if (fetchedData) {
        console.log("Fetched new dish data:", fetchedData);
        const formattedData = {
          ...fetchedData,
          price: typeof fetchedData.price === 'number'
                 ? fetchedData.price.toLocaleString("de-DE") + 'đ'
                 : fetchedData.price
        };
        setCurrentDishData(formattedData);
      } else {
        console.warn(`Dish with ID ${initialData.id} not found or failed to fetch.`);
        setError("Không tìm thấy thông tin món ăn hoặc có lỗi xảy ra.");
      }
    } catch (err) {
      console.error("Error fetching dish details:", err);
      setError("Lỗi kết nối hoặc xử lý dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [initialData?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchDishDetails();
    }, [fetchDishDetails])
  );

  if (isLoading && !currentDishData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
      </View>
    );
  }

  if (!currentDishData) {
      return (
          <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải dữ liệu món ăn.</Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
      );
  }

  const displayPrice = currentDishData.price;
  const isAvailable = currentDishData.available === true || currentDishData.available === 'available';

  return (
    <View style={styles.container}>
      {isLoading && (
           <View style={styles.inlineLoading}>
               <ActivityIndicator size="small" color={Colors.DEFAULT_WHITE} />
           </View>
       )}
      <Image
        source={{ uri: currentDishData.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.information}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.dishName}>{currentDishData.name}</Text>
        {currentDishData.description && (
            <Text style={styles.dishDescription}>{currentDishData.description}</Text>
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá bán: </Text>
          <Text style={styles.priceValue}>
            {displayPrice}
          </Text>
        </View>
        <Text
          style={[
            styles.statusText,
            { color: isAvailable ? Colors.DEFAULT_GREEN : Colors.DEFAULT_RED },
          ]}
        >
          {isAvailable ? "Đang bán" : "Tạm dừng bán"}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.editButton,
            { marginBottom: insets.bottom + Display.setHeight(2.5) },
             (isLoading || error === "Không tìm thấy thông tin món ăn hoặc có lỗi xảy ra.") && styles.disabledButton
          ]}
          onPress={() => navigation.navigate("EditDish", { dishData: currentDishData })}
          disabled={isLoading || error === "Không tìm thấy thông tin món ăn hoặc có lỗi xảy ra."}
        >
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.DEFAULT_WHITE,
  },
   inlineLoading: {
        position: 'absolute',
        top: Display.setHeight(2),
        right: Display.setWidth(4),
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 15,
        zIndex: 10,
    },
  errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  errorText: {
      color: Colors.DEFAULT_RED,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 8 / 7,
  },
  information: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(2),
    gap: Display.setHeight(1.8),
  },
  dishName: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors.DEFAULT_BLACK
  },
  dishDescription: {
      fontSize: 16,
      color: Colors.SECONDARY_BLACK,
      lineHeight: 22,
  },
  priceContainer: {
      flexDirection: "row",
      alignItems: 'center',
  },
  priceLabel: {
      fontSize: 18,
      color: Colors.SECONDARY_BLACK
  },
  priceValue: {
      fontSize: 18,
      color: Colors.DEFAULT_ORANGE,
      fontWeight: "bold",
  },
  statusText: {
      fontSize: 18,
      fontWeight: "bold",
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Display.setWidth(5),
    paddingBottom: Display.setHeight(2.5),
    backgroundColor: Colors.DEFAULT_WHITE,
    
    alignItems: 'flex-end',
  },
  button: {
    paddingHorizontal: Display.setWidth(7),
    paddingVertical: Display.setHeight(1.5),
    height: 'auto',
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: Display.setWidth(30),
  },
  buttonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
  },
   disabledButton: {
        backgroundColor: Colors.LIGHT_GREY,
        opacity: 0.7,
    },
});