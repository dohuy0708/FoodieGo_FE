import React from "react";
import { Color } from "../../constants";
import { View, Text, Image, StyleSheet,TouchableOpacity } from "react-native";
import Display from "../../utils/Display"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function DishDetail({ navigation, route }) {
  const { data } = route.params;
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Image source={{ uri: data.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.information}>
    
        <Text style={{ fontSize: 24, fontWeight: "bold", color: Color.DEFAULT_BLACK }}>{data.name}</Text>
        <Text style={{ fontSize: 16, color: Color.SECONDARY_BLACK }}>{data.description}</Text>
        <View style={{ flexDirection: "row", gap: Display.setWidth(12) }}> 
          <Text style={{ fontSize: 18, color: Color.SECONDARY_BLACK }}>Giá bán: </Text>
          <Text
            style={{
              fontSize: 18,
              color: Color.DEFAULT_ORANGE,
              fontWeight: "bold",
            }}
          >
            {data.price}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 18,
           
            color: data.status === "Đang bán" ? Color.DEFAULT_GREEN : Color.DEFAULT_RED,
            fontWeight: "bold",
          }}
        >
          {data.status}
        </Text>
      </View>

     
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.deleteButton
          ]}
          onPress={() => {
            
            console.log("Delete dish:", data.id);
          
          }}
        >
          <Text style={styles.buttonText}>Xóa món ăn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.editButton,{marginBottom: insets.bottom + Display.setHeight(2.5)}]}
         onPress={() => navigation.navigate("EditDish", { dishData: data })} >
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
  image: {
    width: "100%",
    aspectRatio: 8/7,
 
  },
  information: {
    paddingHorizontal: Display.setWidth(5), 
    paddingVertical: Display.setHeight(1), 
    gap: Display.setHeight(1.8), 
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(3), 
    position: 'absolute',
    bottom: Display.setHeight(2.5), 
    right: Display.setWidth(5), 
    
  },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
    height: Display.setHeight(6), 
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: Display.setWidth(25), 
  },
  buttonText: {
      color: Color.DEFAULT_WHITE,
      fontSize: 16,
      fontWeight: '500',
  },
  deleteButton: {
      backgroundColor: Color.DEFAULT_YELLOW, 
  },
  editButton: {
      backgroundColor: Color.DEFAULT_GREEN, 

  },
});