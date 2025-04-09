import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Calendar } from "react-native-calendars";
import Feather from "@expo/vector-icons/Feather";
import { Color } from "../../constants";



export default function Statistic() {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;
  const [viewType, setViewType] = useState("week");
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const orderNumber = 1000;
  const orderRevenue = 1000000;
  const topDish = [
    { name: "Mì xào hải sản", quantity: 100 },
    { name: "Cơm tấm sườn bì chả", quantity: 80 },
    { name: "Bánh mì thịt nướng", quantity: 60 },
    { name: "Phở bò tái chín", quantity: 50 },
    { name: "Gà rán", quantity: 40 },
    { name: "Bún chả Hà Nội", quantity: 30 },
    { name: "Cá kho tộ", quantity: 20 },
    { name: "Chả giò", quantity: 10 },
    { name: "Sushi", quantity: 5 },
    { name: "Pizza", quantity: 2 },
  ];
  /////////Set up Bottom Sheet//////////
  const toggleBottomSheet = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(slideAnim, {
      toValue,
      friction: 9, 
      tension: 70,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getWeekDates = (selectedDate) => {
    const date = new Date(selectedDate);
    const day = date.getDay(); 

    const startDate = new Date(date);
  
    startDate.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); 

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };
  const onMonthPress = (month) => {
    setCurrentMonth(month);
  };
  const onDayPress = (day) => {
    const weekDates = getWeekDates(day.dateString);
    setSelectedStartDate(weekDates.start);
    setSelectedEndDate(weekDates.end);
  };

  const renderWeekPicker = () => {
    const markedDates = {};

    if (selectedStartDate && selectedEndDate) {
      let currentDate = new Date(selectedStartDate);
      const endDate = new Date(selectedEndDate);
     
      endDate.setHours(12, 0, 0, 0); 

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        markedDates[dateString] = {
          selected: true,
        
          color: Color.DEFAULT_WHITE, 
          textColor: Color.DEFAULT_GREEN, 
        };
       

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return (
      <View style={styles.pickerContainer}>
        {selectedStartDate && selectedEndDate && (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.dateInfoText}>
              Tuần từ {formatDate(selectedStartDate)} đến{" "}
              {formatDate(selectedEndDate)}
            </Text>
          </View>
        )}
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
       
          theme={{
            backgroundColor: Color.DEFAULT_GREEN,
            calendarBackground: Color.DEFAULT_GREEN,
            textSectionTitleColor: "white",
            selectedDayBackgroundColor: Color.DEFAULT_WHITE, 
            selectedDayTextColor: Color.DEFAULT_GREEN, 
            todayTextColor: Color.DEFAULT_YELLOW,
            dayTextColor: "white",
            monthTextColor: "white",
            arrowColor: "white",
            textDisabledColor: Color.DEFAULT_GREY,
            'stylesheet.calendar.header': { 
              week: {
                marginTop: 5,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }
            },
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
          firstDay={1} // Start week on Monday
         
        />
      </View>
    );
  };
  const renderMonthPicker = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <View style={styles.monthPickerContainer}>
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setCurrentYear((year) => year - 1)}
          >
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.yearText}>{currentYear}</Text>

          <TouchableOpacity
            style={styles.yearArrowButton}
            onPress={() => setCurrentYear((year) => year + 1)}
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
                currentMonth === month && styles.selectedMonth,
              ]}
              onPress={() => onMonthPress(month)}
            >
              <Text
                style={[
                  styles.monthText,
                  currentMonth === month && styles.selectedMonthText,
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
  /////////////////Set Up Chart//////////////////////
  const [weeklyData, setWeeklyData] = useState({
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
   
    data: [300, 500, 400, 700, 600, 800, 900], 
  });
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
   
    color: (opacity = 1) => {
     
      const rgb = Color.DEFAULT_GREEN.replace("#", "");
      const r = parseInt(rgb.substring(0, 2), 16);
      const g = parseInt(rgb.substring(2, 4), 16);
      const b = parseInt(rgb.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
    strokeWidth: 2, 
    barPercentage: 0.8, 
    useShadowColorFromDataset: false, 
    decimalPlaces: 0, 
    propsForDots: { 
      r: "6",
      strokeWidth: "2",
      stroke: Color.DEFAULT_GREEN
    },
    propsForBackgroundLines: { 
      strokeDasharray: "", 
      stroke: "#e3e3e3" 
    }
  };

  const renderChart = () => {
    return (
      <View style={styles.chartOuterContainer}>
        <Text style={styles.chartTitle}>Doanh thu theo ngày</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: weeklyData.data,
                 
                },
              ],
       
            }}
            width={Math.max(Dimensions.get("window").width - 40, weeklyData.labels.length * 60)} 
            height={300}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            yAxisLabel="" 
            yAxisSuffix="k" 
            verticalLabelRotation={0}
           

          />
        </ScrollView>
        <Text style={styles.chartUnitText}>
          Đơn vị : nghìn VNĐ
        </Text>
      </View>
    );
  };
  //////////////////////////////////////
  return (
   
    <View style={styles.mainContainer}>
  
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer} 
      >
        <Text style={styles.header}>Thống kê</Text>

       
        <View style={styles.dateDisplayContainer}>
          {viewType === "week" ? (
            selectedStartDate && selectedEndDate ? (
              <Text style={styles.dateDisplayText}>
                {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
              </Text>
            ) : (
              <Text style={styles.dateDisplayText}>Chưa chọn tuần</Text>
            )
          ) : (
            <Text style={styles.dateDisplayText}>
              Tháng {currentMonth}/{currentYear}
            </Text>
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
                <Text style={styles.statisticValue}>{formatCurrency(orderRevenue)} VNĐ</Text>
            </View>
        </View>


        
        {renderChart()}

     
        <View >
          <Text style={styles.topDishesTitle}>Top 10 món ăn đặt nhiều nhất</Text>
            {topDish.map((dish, index) => (
              <View
                key={index}
                style={[
                  styles.topDishItem,
                  { backgroundColor: index % 2 === 0 ? Color.LIGHT_GREY : Color.DEFAULT_WHITE }
                ]}
              >
                <Text style={styles.topDishText} numberOfLines={1} ellipsizeMode="tail">
                    {index + 1}. {dish.name}
                </Text>
                <Text style={styles.topDishQuantity}>{dish.quantity} lượt</Text>
              </View>
            ))}
        </View>
     

      </ScrollView>

 
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
                viewType === "week" && styles.selectedType,
              ]}
              onPress={() => setViewType("week")}
            >
              <Text
                style={[
                  styles.typeText,
                  viewType === "week" && styles.selectedTypeText,
                ]}
              >
                Tuần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                viewType === "month" && styles.selectedType,
              ]}
              onPress={() => setViewType("month")}
            >
              <Text
                style={[
                  styles.typeText,
                  viewType === "month" && styles.selectedTypeText,
                ]}
              >
                Tháng
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

 
          {viewType === "week" ? renderWeekPicker() : renderMonthPicker()}

          <TouchableOpacity style={styles.applyButton} onPress={toggleBottomSheet}>
            <Text style={styles.applyButtonText}>
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View> 
  );
}

const styles = StyleSheet.create({
  
  mainContainer: {
    flex: 1,
    backgroundColor: Color.DEFAULT_WHITE, 
  },
  
  scrollContainer: {
     width: "100%",

  },
  
  scrollContentContainer: {
    paddingHorizontal: 15, 
    paddingTop: 40,
    paddingBottom: 30, 
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28, 
  },
  dateDisplayContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: Color.LIGHT_GREY,
    borderRadius: 8,
    paddingHorizontal: 10, 
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  
  statsRow: {
    marginBottom: 25,
    gap: 15, 
  },
  statisticBox: {
    flex: 1, 
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: Color.LIGHT_GREY, 
    borderRadius: 8,
    alignItems: 'center',
    gap: 8, 
  },
  statisticLabel: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  statisticValue: {
    fontSize: 18,
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    textAlign: 'center',
  },
  
  chartOuterContainer: {
    backgroundColor: "#fff", 
    paddingVertical: 15,
   
    borderRadius: 10,
    marginBottom: 25, 
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,

  },
  chartTitle: {
    fontSize: 18,
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
   
  },
  chartUnitText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },

  
  topDishesContainer: {
    marginBottom: 20, 
    
    borderRadius: 8,
    paddingBottom: 5, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
   topDishesTitle: {
    fontSize: 18,
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    paddingVertical: 15,
    paddingHorizontal: 15,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: Color.LIGHT_GREY,
   },
  topDishItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Color.LIGHT_GREY, 
  },
  topDishText: {
    fontSize: 16,
    color: '#333',
    flex: 1, 
    marginRight: 10, 
  },
  topDishQuantity: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },


  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "80%", 
    bottom: 0, 
    backgroundColor: Color.DEFAULT_GREEN,
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
    padding: 20,
    paddingTop: 40, 
  },
  closeButton: {
    position: "absolute",
    top: 15, 
    right: 15,
    zIndex: 1, 
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10, 
    paddingHorizontal: 25, 
    borderRadius: 20, 
  },
  selectedType: {
    backgroundColor: Color.DEFAULT_WHITE,
  },
  typeText: {
    color: Color.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: Color.DEFAULT_GREEN,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Color.DEFAULT_WHITE, 
    opacity: 0.5, 
    marginVertical: 20, 
  },
  pickerContainer: {
    flex: 1,
    width: "100%",
  },
  selectedDateInfo: {
    marginBottom: 15, 
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    borderRadius: 10,
    alignItems: "center",
  },
  dateInfoText: {
    color: Color.DEFAULT_WHITE, 
    fontSize: 14,
    fontWeight: "500",
  },
  monthPickerContainer: {
    flex: 1, 
    width: "100%",
    gap: 20,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center', 
    paddingHorizontal: 20, 
  },
  yearArrowButton: {
      padding: 5, 
  },
  yearText: {
    color: "white",
    fontSize: 18, 
    fontWeight: 'bold',
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15, 
  },
  monthButton: {
    width: "30%", 
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)', 
    alignItems: "center",
  },
  selectedMonth: {
    backgroundColor: Color.DEFAULT_WHITE,
    borderColor: Color.DEFAULT_WHITE, 
  },
  monthText: {
    color: "white",
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMonthText: {
    color: Color.DEFAULT_GREEN,
  },
  applyButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 25,
    borderRadius: 25, 
    marginTop: 20, 
    alignSelf: "center", 
    backgroundColor: Color.DEFAULT_WHITE,
    
     shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  applyButtonText:{ 
    color: Color.DEFAULT_GREEN,
    fontSize: 18,
    fontWeight: 'bold',
  }

  
});