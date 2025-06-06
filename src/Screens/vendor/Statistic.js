import React, { useState, useRef, useEffect, use } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import useSessionStore from "../../utils/store";
// Calendar import is removed as it's no longer used
import Feather from "@expo/vector-icons/Feather";
import Colors from "../../constants/Colors";
import Nav from "../../components/Nav";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { getTop10MenuByRestaurantId,getTotalOrderByRestaurantId,getTotalRevenueByRestaurantId, getTotalRevenueByRestaurantIdByYear } from "../../services/vendorService";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const NAV_HEIGHT = Display.setHeight(7);

export default function Statistic({ navigation }) {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const restaurantId = useSessionStore((state) => state.restaurantId);
  // View type for the main screen: 'month' or 'year'
  const [viewType, setViewType] = useState("month");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // State for bottom sheet picker
  const [pickerSelectionType, setPickerSelectionType] = useState(viewType); // 'month' or 'year'
  const [tempSelectedYear, setTempSelectedYear] = useState(currentYear);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(currentMonth);

  const insets = useSafeAreaInsets();

  // --- Mock Data - In a real app, this would be fetched based on filters ---
  const [orderNumber, setOrderNumber] = useState(0);
  const [orderRevenue, setOrderRevenue] = useState(0);
  const [topDish, setTopDish] = useState([]);

  const [yearlyChartData, setYearlyChartData] = useState({
    labels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ],
    datasets: [
      {
        data: [300, 500, 400, 700, 600, 800, 900, 750, 650, 850, 950, 1000], // Sample monthly revenue
      },
    ],
  });
  // --- End Mock Data ---

  // Effect to simulate data fetching when filters change
 
  useEffect(() => {
    const fetchTopDishes = async () => {
      let responseDish;
      try {
        if(viewType === "year") {
            responseDish = await getTop10MenuByRestaurantId(restaurantId, currentYear,null);
        }
        else {
            responseDish = await getTop10MenuByRestaurantId(restaurantId, currentYear, currentMonth);
        }
        if (responseDish ) {
          
          const topDishes = responseDish.map((dish) => ({
            name: dish.menu.name,
            quantity: dish.totalOrders,
          }));
          console.log("Top  data:", topDishes);
          setTopDish(topDishes);
        }
      } catch (error) {
        console.error("Error fetching top dishes:", error);
      }
    };
    fetchTopDishes();
  }, [viewType, currentYear, currentMonth]);
  useEffect(() => {
    const fetchOrderData = async () => {
      let responseOrder;
      let responseRevenue;
      try {
        if(viewType === "year") {
            responseOrder = await getTotalOrderByRestaurantId(restaurantId, currentYear, undefined);
            responseRevenue = await getTotalRevenueByRestaurantId(restaurantId, currentYear, undefined);
        }
        else {
            responseOrder = await getTotalOrderByRestaurantId(restaurantId, currentYear, currentMonth);
            responseRevenue = await getTotalRevenueByRestaurantId(restaurantId, currentYear, currentMonth);
        }
        if (responseOrder) {
         
          console.log("Order data:", responseOrder);
         
          setOrderNumber( responseOrder);
        }
        if (responseRevenue) {
          console.log("Revenue data:", responseRevenue);
          setOrderRevenue(responseRevenue);
        }
        
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };
    fetchOrderData();
  }, [viewType, currentYear, currentMonth]);
  useEffect(() => {
    const fetchYearlyChartData = async () => {
      let responseYearlyData;
      try {
        responseYearlyData = await getTotalRevenueByRestaurantIdByYear(restaurantId, currentYear);
        if (responseYearlyData) {
          const chartData = {
            labels: [
              "T1",
              "T2",
              "T3",
              "T4",
              "T5",
              "T6",
              "T7",
              "T8",
              "T9",
              "T10",
              "T11",
              "T12",
            ],
            datasets: [
              {
                data: responseYearlyData.map((item) => item.totalRevenue/1000),
              },
            ],
          };
          setYearlyChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching yearly chart data:", error);
      }
    };
    fetchYearlyChartData();
  }, [currentYear]);
  const toggleBottomSheet = () => {
    if (!isOpen) {
      // Sync picker state with current main view state when opening
      setPickerSelectionType(viewType);
      setTempSelectedYear(currentYear);
      setTempSelectedMonth(currentMonth);
    }
    const toValue = isOpen ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      friction: 9,
      tension: 70,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleApplyFilters = () => {
    setViewType(pickerSelectionType);
    setCurrentYear(tempSelectedYear);
    if (pickerSelectionType === "month") {
      setCurrentMonth(tempSelectedMonth);
    }
    // Data fetching/update will be triggered by the useEffect hook
    toggleBottomSheet();
  };

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // --- Picker Render Functions ---
  const renderMonthAndYearPicker = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return (
      <View style={styles.monthPickerContainer}>
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setTempSelectedYear((year) => year - 1)}
          >
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{tempSelectedYear}</Text>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setTempSelectedYear((year) => year + 1)}
          >
            <Feather name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.monthsGrid}>
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                tempSelectedMonth === month && styles.selectedMonth,
              ]}
              onPress={() => setTempSelectedMonth(month)}
            >
              <Text
                style={[
                  styles.monthText,
                  tempSelectedMonth === month && styles.selectedMonthText,
                ]}
              >
                Tháng {month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderYearPicker = () => {
    return (
      <View style={styles.monthPickerContainer}>
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setTempSelectedYear((year) => year - 1)}
          >
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{tempSelectedYear}</Text>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setTempSelectedYear((year) => year + 1)}
          >
            <Feather name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginTop: Display.setHeight(2) }}>
          <Text style={{ color: Colors.DEFAULT_WHITE, fontSize: 16 }}>
            Thống kê cho cả năm {tempSelectedYear}
          </Text>
        </View>
      </View>
    );
  };

  // --- Chart Setup ---
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => {
      const rgb = Colors.DEFAULT_GREEN.replace("#", "");
      const r = parseInt(rgb.substring(0, 2), 16);
      const g = parseInt(rgb.substring(2, 4), 16);
      const b = parseInt(rgb.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6, // Adjusted for more bars
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: Colors.DEFAULT_GREEN,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e3e3e3",
    },
  };

  const renderChart = () => {
    // Chart width calculation for 12 months
    const chartContentWidth =
      yearlyChartData.labels.length * Display.setWidth(10); // Approx 40px per bar
    const chartWidth = Math.max(
      screenWidth - Display.setWidth(10),
      chartContentWidth
    );

    return (
      <View style={styles.chartOuterContainer}>
        <Text style={styles.chartTitle}>
          Doanh thu theo tháng năm {currentYear}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={yearlyChartData}
            width={chartWidth}
            height={Display.setHeight(37)} // ~300px
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            yAxisLabel=""
            yAxisSuffix="k" // Assuming data is in thousands
            verticalLabelRotation={0}
          />
        </ScrollView>
        <Text style={styles.chartUnitText}>Đơn vị : nghìn VNĐ</Text>
      </View>
    );
  };

  // --- Main Render ---
  return (
    <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
       <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Thống kê</Text>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
     

        <View style={styles.dateDisplayContainer}>
          {viewType === "month" ? (
            <Text style={styles.dateDisplayText}>
              Tháng {currentMonth}/{currentYear}
            </Text>
          ) : (
            <Text style={styles.dateDisplayText}>Năm {currentYear}</Text>
          )}
          <TouchableOpacity onPress={toggleBottomSheet}>
            <Feather name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statisticBox}>
            <Text style={styles.statisticLabel}>Tổng số đơn hàng</Text>
            <Text style={styles.statisticValue}>{orderNumber}</Text>
          </View>
          <View style={styles.statisticBox}>
            <Text style={styles.statisticLabel}>Tổng doanh thu</Text>
            <Text style={styles.statisticValue}>
              {formatCurrency(orderRevenue)} VNĐ
            </Text>
          </View>
        </View>

        {viewType === "year" && renderChart()}

        <View style={styles.topDishesContainer}>
          <Text style={styles.topDishesTitle}>
            Top 10 món ăn đặt nhiều nhất
          </Text>
          {topDish&&topDish.map((dish, index) => (
            <View
              key={index}
              style={[
                styles.topDishItem,
                {
                  backgroundColor:
                    index % 2 === 0 ? Colors.LIGHT_GREY : Colors.DEFAULT_WHITE,
                },
              ]}
            >
              <Text
                style={styles.topDishText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {index + 1}. {dish.name}
              </Text>
              <Text style={styles.topDishQuantity}>{dish.quantity} lượt</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navArea}>
        <Nav nav={navigation} />
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.bottomSheetContent}>
          <TouchableOpacity
            onPress={toggleBottomSheet}
            style={styles.closeButton}
          >
            <Feather name="x" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickerSelectionType === "month" && styles.selectedType,
              ]}
              onPress={() => setPickerSelectionType("month")}
            >
              <Text
                style={[
                  styles.typeText,
                  pickerSelectionType === "month" && styles.selectedTypeText,
                ]}
              >
                Tháng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickerSelectionType === "year" && styles.selectedType,
              ]}
              onPress={() => setPickerSelectionType("year")}
            >
              <Text
                style={[
                  styles.typeText,
                  pickerSelectionType === "year" && styles.selectedTypeText,
                ]}
              >
                Năm
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {pickerSelectionType === "month"
            ? renderMonthAndYearPicker()
            : renderYearPicker()}

          <TouchableOpacity
            style={[styles.applyButton,{marginBottom:Display.setHeight(4.5)}]}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    paddingHorizontal: Display.setWidth(4),
    paddingTop: Display.setHeight(5),
    paddingBottom: NAV_HEIGHT + Display.setHeight(2),
  },
  header: {
    textAlign: "center",
   
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
  },
  dateDisplayContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Display.setHeight(2.5),
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: Colors.LIGHT_GREY,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(2.5),
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  statsRow: {
    marginBottom: Display.setHeight(3),
    flexDirection: "row",
    gap: Display.setWidth(4),
  },
  statisticBox: {
    flex: 1,
    paddingVertical: Display.setHeight(1.8),
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: Colors.LIGHT_GREY,
    borderRadius: 8,
    alignItems: "center",
    gap: Display.setHeight(1),
  },
  statisticLabel: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  statisticValue: {
    fontSize: 18,
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    textAlign: "center",
  },
  chartOuterContainer: {
    backgroundColor: "#fff",
    paddingVertical: Display.setHeight(1.8),
    borderRadius: 10,
    marginBottom: Display.setHeight(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    marginBottom: Display.setHeight(1.8),
    textAlign: "center",
  },
  chart: {
    marginVertical: Display.setHeight(1),
    borderRadius: 16,
  },
  chartUnitText: {
    textAlign: "center",
    marginTop: Display.setHeight(1.2),
    fontSize: 12,
    color: "#666",
  },
  topDishesContainer: {
    marginBottom: Display.setHeight(2.5),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    overflow: "hidden",
  },
  topDishesTitle: {
    fontSize: 18,
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    paddingVertical: Display.setHeight(1.8),
    paddingHorizontal: Display.setWidth(4),
    textAlign: "center",
    backgroundColor: Colors.LIGHT_GREY,
  },
  topDishItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(4),
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GREY2,
  },
  topDishText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: Display.setWidth(2.5),
  },
  topDishQuantity: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  navArea: {
    height: NAV_HEIGHT,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GREY2,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "80%", // Can be adjusted
    bottom: 0,
    backgroundColor: Colors.DEFAULT_GREEN,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetContent: {
    flex: 1,
    padding: Display.setWidth(5),
    paddingTop: Display.setHeight(5), // Increased padding to not overlap close button
  },
  closeButton: {
    position: "absolute",
    top: Display.setHeight(1.8),
    right: Display.setWidth(4),
    zIndex: 1,
    padding: Display.setWidth(1.5),
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Display.setHeight(2.5),
  },
  typeButton: {
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(6),
    borderRadius: 20,
  },
  selectedType: {
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  typeText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  selectedTypeText: {
    color: Colors.DEFAULT_GREEN,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    opacity: 0.5,
    marginVertical: Display.setHeight(2.5),
  },
  // Styles for Month & Year Picker in BottomSheet
  monthPickerContainer: {
    // Reused for both month&year and year-only picker
    flex: 1, // Allow it to take available space
    width: "100%",
    gap: Display.setHeight(2.5),
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Display.setWidth(5),
    marginTop: Display.setHeight(1), // Added margin for spacing
  },
  yearArrowButton: {
    padding: Display.setWidth(1.2),
  },
  yearText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Display.setWidth(4), // Gap between month buttons
  },
  monthButton: {
    width: "30%", // Adjust for 3 buttons per row
    paddingVertical: Display.setHeight(1.8),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
  },
  selectedMonth: {
    backgroundColor: Colors.DEFAULT_WHITE,
    borderColor: Colors.DEFAULT_WHITE,
  },
  monthText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedMonthText: {
    color: Colors.DEFAULT_GREEN,
  },
  applyButton: {
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(6),
    borderRadius: 25,
    marginTop: Display.setHeight(2.5), // Ensure it's visible
    alignSelf: "center",
    backgroundColor: Colors.DEFAULT_WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  applyButtonText: {
    color: Colors.DEFAULT_GREEN,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
   justifyContent: "flex-start",
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: "#ffffff",
    
  },
  backButton: { padding: 8 },
});
