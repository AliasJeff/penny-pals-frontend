import React, { Component } from "react";
import { View } from "@tarojs/components";
import { EChart } from "echarts-taro3-react";
import "./index.less";

export default class LineChart extends Component {
  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.dailyExpenses) !==
        JSON.stringify(this.props.dailyExpenses) ||
      prevProps.isIncome !== this.props.isIncome
    ) {
      this.updateChart();
    }
  }

  updateChart() {
    const { dailyExpenses } = this.props;
    if (!dailyExpenses || !dailyExpenses.length) return;

    const chartOptions = this.getChartOptions(dailyExpenses);
    this.lineChart.refresh(chartOptions);
  }

  getChartOptions(dailyExpenses) {
    const { isIncome = false } = this.props;
    const dates = dailyExpenses.map((day) => day.label);
    const values = dailyExpenses.map((day) => day.amount);

    // Calculate average and max values
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maxValue = Math.max(...values);

    // Set colors based on data type (expense or income)
    const mainColor = isIncome ? "#2DAC4A" : "#5272f9";
    const avgLineColor = isIncome ? "#17a554" : "#ff9f00";
    const maxLineColor = isIncome ? "#147b3e" : "#ff5252";

    return {
      color: [mainColor],
      tooltip: {
        trigger: "axis",
        formatter: "{b}: ¥{c}",
        axisPointer: {
          type: "line",
        },
      },
      grid: {
        left: "10%",
        right: "10%",
        bottom: "10%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          interval: Math.floor(dates.length / 7), // Show fewer labels if many dates
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        show: true, // Changed to true to show axis
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            opacity: 0.2,
          },
        },
      },
      series: [
        {
          name: isIncome ? "收入" : "支出",
          data: values,
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          sampling: "average",
          itemStyle: {
            color: mainColor,
          },
          emphasis: {
            itemStyle: {
              color: avgLineColor,
              borderColor: avgLineColor,
              borderWidth: 2,
            },
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `rgba(${
                    isIncome ? "45, 172, 74" : "82, 114, 249"
                  }, 0.3)`,
                },
                {
                  offset: 1,
                  color: `rgba(${
                    isIncome ? "45, 172, 74" : "82, 114, 249"
                  }, 0.1)`,
                },
              ],
            },
          },
          markLine: {
            animation: false,
            symbol: "none",
            silent: true,
            lineStyle: {
              width: 1,
            },
            data: [
              {
                yAxis: avgValue,
                name: "平均值",
                label: {
                  formatter: "平均值: ¥{c}",
                  position: "insideEndTop",
                  backgroundColor: `rgba(${
                    isIncome ? "23, 165, 84" : "255, 159, 0"
                  }, 0.8)`,
                  padding: [2, 4],
                  borderRadius: 2,
                  color: "#fff",
                },
                lineStyle: {
                  color: avgLineColor,
                  type: "solid",
                  width: 1,
                },
              },
              {
                yAxis: maxValue,
                name: "最大值",
                label: {
                  formatter: "最大值: ¥{c}",
                  position: "insideEndTop",
                  backgroundColor: `rgba(${
                    isIncome ? "20, 123, 62" : "255, 82, 82"
                  }, 0.8)`,
                  padding: [2, 4],
                  borderRadius: 2,
                  color: "#fff",
                },
                lineStyle: {
                  color: maxLineColor,
                  type: "solid",
                  width: 1,
                },
              },
            ],
          },
        },
      ],
    };
  }

  lineChart = null;

  refLineChart = (node) => (this.lineChart = node);

  render() {
    const { style = { width: "100%", height: "200px" } } = this.props;

    return (
      <View className="line-chart">
        <EChart ref={this.refLineChart} canvasId="line-canvas" style={style} />
      </View>
    );
  }
}
