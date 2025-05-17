import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const AddressItem = ({ address, isDefault, onEdit }) => {
  return (
    <View style={styles.addressItemContainer}>
      <View style={styles.addressIconContainer}>
        {isDefault ? (
          <Ionicons name="location" size={22} color="#000" />
        ) : (
          <Ionicons name="bookmark" size={22} color="#000" />
        )}
      </View>
      <View style={styles.addressContent}>
        <Text style={styles.addressText}>{address.addressLine}</Text>
        <Text style={styles.personInfo}>
          {address.name} | {address.phone}
        </Text>
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddressScreen = ({ navigation }) => {
  const defaultAddress = {
    id: 1,
    addressLine: "KTX khu A, Phường Đông Hòa, Dĩ An, Bình Dương",
    name: "Hoàng Huy",
    phone: "0654428222",
    isDefault: true,
  };

  const savedAddresses = [
    {
      id: 2,
      addressLine:
        "Trường đại học Công Nghệ Thông Tin, Khu phố 6, Dĩ An, Bình Dương",
      name: "Hoàng Huy",
      phone: "0654428222",
      isDefault: false,
    },
    {
      id: 3,
      addressLine: "Nhà của tui",
      name: "Hoàng Huy",
      phone: "0654428222",
      isDefault: false,
    },
    {
      id: 4,
      addressLine: "KTX khu B",
      name: "Hoàng Huy",
      phone: "0654428222",
      isDefault: false,
    },
  ];

  const handleEditAddress = (address) => {
    // Handle edit address functionality here
    console.log("Edit address:", address);
  };

  const handleAddAddress = () => {
    // Navigate to add new address screen
    console.log("Add new address");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Header
          title="Địa chỉ giao hàng"
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.addressList}>
          {/* Default delivery address */}
          <AddressItem
            address={defaultAddress}
            isDefault={true}
            onEdit={() => handleEditAddress(defaultAddress)}
          />

          {/* Saved addresses section */}
          <Text style={styles.sectionTitle}>Địa chỉ đã lưu</Text>

          {/* List of saved addresses */}
          {savedAddresses.map((address, index) => (
            <React.Fragment key={address.id}>
              <AddressItem
                address={address}
                isDefault={false}
                onEdit={() => handleEditAddress(address)}
              />
              {index < savedAddresses.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  addressList: {
    marginTop: 60,

    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#757575",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  addressItemContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  addressIconContainer: {
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    marginBottom: 4,
  },
  personInfo: {
    fontSize: 14,
    color: "#757575",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  editButtonText: {
    color: "#009688",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 50,
  },
  addButton: {
    backgroundColor: "#009688",
    padding: 14,
    margin: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AddressScreen;
