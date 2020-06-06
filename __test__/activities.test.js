const date = require("date-fns");
const d = require("../drawChart");

describe("activities", () => {
  test("should ", () => {
    const now = new Date();
    console.log('start', date.formatDistanceStrict(date.add(now, { hours: 1, minutes: 10 }), now));
    const activities = [
      {
        start: date.add(now, { minutes: 10 }),
        end: date.add(now, { minutes: 15 }),
      },
      {
        start: date.add(now, { minutes: 20 }),
        end: date.add(now, { minutes: 30 }),
      },
      {
        start: date.add(now, { minutes: 50 }),
        end: null,
      },
    ];

    const dataArr = d.getData(activities);

    console.log(dataArr);
  });
});
