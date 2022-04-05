export const getCircularIndex = (
  curVal: number,
  maxVal: number,
  direction: "+" | "-"
) => {
  switch (direction) {
    case "+":
      return (curVal + 1) % maxVal;
    case "-":
      return curVal - 1 < 0 ? maxVal - 1 : curVal - 1;
  }
};
