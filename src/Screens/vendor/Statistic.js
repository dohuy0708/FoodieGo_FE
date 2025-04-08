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
  /////////Set up Bottom Sheet//////////
  const toggleBottomSheet = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };
  const formatDate = (dateString) => {
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

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        markedDates[dateString] = {
          selected: true,
          color: "white",
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
            selectedDayBackgroundColor: "white",
            selectedDayTextColor: Color.DEFAULT_GREEN,
            todayTextColor: Color.DEFAULT_YELLOW,
            dayTextColor: "white",
            monthTextColor: "white",
            arrowColor: "white",
            textDisabledColor: Color.DEFAULT_GREY,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
          firstDay={1}
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
    data: [300, 500, 400, 700, 600, 800, 900]
  });
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => {
      const rgb = Color.DEFAULT_GREEN.replace('#', '');
      const r = parseInt(rgb.substring(0, 2), 16);
      const g = parseInt(rgb.substring(2, 4), 16);
      const b = parseInt(rgb.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    strokeWidth: 1,
    barPercentage: 1.2,
    decimalPlaces: 0
  };

  const renderChart = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Doanh thu theo ngày</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: weeklyData.labels,
              datasets: [{
                data: weeklyData.data
              }]
            }}
            width={Math.max(Dimensions.get("window").width - 40, 600)} // Minimum width 500
            height={300} // Tăng chiều cao
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            yAxisLabel=""
            yAxisSuffix=""
            verticalLabelRotation={0}
          />
        </ScrollView>
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Đơn vị : nghìn VNĐ
        </Text>
      </View>
    );
  };
  //////////////////////////////////////
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thống kê</Text>

      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
        }}
      >
        {viewType === "week" ? (
          selectedStartDate && selectedEndDate ? (
            <Text style={{ fontSize: 16 }}>
              {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
            </Text>
          ) : (
            <Text style={{ fontSize: 16 }}>Chưa chọn tuần</Text>
          )
        ) : (
          <Text style={{ fontSize: 16 }}>
            Tháng {currentMonth}/{currentYear}
          </Text>
        )}
        <TouchableOpacity onPress={toggleBottomSheet}>
          <Feather name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.statisticContainer}>
        <Text style={{ fontSize: 16 }}>Tổng số đơn hàng</Text>
        <Text
          style={{
            fontSize: 18,
            color: Color.DEFAULT_GREEN,
            fontWeight: "bold",
          }}
        >
          {orderNumber}
        </Text>
      </View>
      <View style={styles.statisticContainer1}>
        <Text style={{ fontSize: 16 }}>Tổng doanh thu</Text>
        <Text
          style={{
            fontSize: 18,
            color: Color.DEFAULT_GREEN,
            fontWeight: "bold",
          }}
        >
           {formatCurrency(orderRevenue)} VNĐ
        </Text>
      </View>
      {renderChart()}
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
            style={{ position: "absolute", top: 0, right: 10 }}
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
          <TouchableOpacity style={styles.button} onPress={toggleBottomSheet}>
            <Text style={{ color: Color.DEFAULT_GREEN, fontSize: 18 }}>
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Color.DEFAULT_WHITE,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 40,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 20,
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    textAlign: "center",

    alignItems: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 30,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 10,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",

    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectedType: {
    backgroundColor: "white",
  },
  typeText: {
    color: "white",
    fontSize: 16,
  },
  selectedTypeText: {
    color: Color.DEFAULT_GREEN,
  },

  pickerTitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
  },
  weeksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  weekItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
  },
  selectedWeek: {
    backgroundColor: "white",
  },
  weekText: {
    color: "white",
    fontSize: 16,
  },
  selectedWeekText: {
    color: Color.DEFAULT_GREEN,
  },
  pickerContainer: {
    flex: 1,
    width: "100%",
  },
  selectedDateInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  dateInfoText: {
    color: Color.DEFAULT_GREEN,
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
    gap: 15,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
  },
  selectedYear: {
    backgroundColor: "white",
  },
  yearText: {
    color: "white",
    fontSize: 16,
  },
  selectedYearText: {
    color: Color.DEFAULT_GREEN,
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  monthButton: {
    width: "28%",
    paddingVertical: 15,
    borderRadius: 10,

    alignItems: "center",
  },
  selectedMonth: {
    backgroundColor: "white",
  },
  monthText: {
    color: "white",
    fontSize: 14,
  },
  selectedMonthText: {
    color: Color.DEFAULT_GREEN,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 30,
    alignSelf: "flex-end",
    backgroundColor: Color.DEFAULT_WHITE,
  },
  statisticContainer: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: Color.LIGHT_GREY,
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statisticContainer1: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: Color.LIGHT_GREY,
    gap: 10,
    alignItems: "center",
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  chartTitle: {
    fontSize: 16,
    color: Color.DEFAULT_GREEN,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
});
