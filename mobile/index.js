// Polyfill the Web Performance API before any libraries load.
// React Native's fallback only provides mark/measure/now — not clearMarks or
// clearMeasures — which causes "mgt.clearMarks is not a function" at runtime
// when react-devtools-core (and similar) try to use the full User Timing API.
if (typeof performance !== "undefined") {
  if (typeof performance.clearMarks !== "function") {
    performance.clearMarks = function () {};
  }
  if (typeof performance.clearMeasures !== "function") {
    performance.clearMeasures = function () {};
  }
  if (typeof performance.getEntriesByName !== "function") {
    performance.getEntriesByName = function () {
      return [];
    };
  }
  if (typeof performance.getEntriesByType !== "function") {
    performance.getEntriesByType = function () {
      return [];
    };
  }
}

const { registerRootComponent } = require("expo");
const { default: App } = require("./App");

registerRootComponent(App);
