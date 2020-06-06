const date = require("date-fns");
const Chart = require("chart.js");

function drawChart(ctx, activities) {
  const datax = getData(activities);

  const data = {
    datasets: [
      {
        backgroundColor: ["rgba(51, 51, 255, 1)", "rgba(0, 255, 0, 1)"],
        borderColor: "#fff",
        borderWidth: 2,
        data: [10, 20],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Busy", "Break"],
  };

  const myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data,
    options: {
      cutoutPercentage: 80,
      maintainAspectRatio: false,
    },
  });
}

function getData(activities) {
  return activities
    .reduce(
      (prev, current) => {
        prev[prev.length - 1].end = current.start;
        prev.push({
          break: false,
          start: current.start,
          end: current.end,
        });
        if (current.end) {
          prev.push({
            break: true,
            start: current.end,
            end: null,
          });
        }
        return prev;
      },
      [{ break: true, start: date.startOfDay(new Date()), end: null }]
    )
    .map((activity) => ({
      ...activity,
      duration: date.differenceInMinutes(activity.end, activity.end),
    }));
}

exports.getData = getData;
exports.drawChart = drawChart;
