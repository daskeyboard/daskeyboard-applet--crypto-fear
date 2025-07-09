const q = require("daskeyboard-applet");
const fetch = require("node-fetch");
const logger = q.logger;

class CryptoFNGIndex extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 24 * 60 * 1000; // runs once every day (index is updated each day at 00:00 GMT)

    logger.info("Crypto FNG Index ready to launch!");
  }

  async getCryptoFNGIndex() {
    try {
      const response = await fetch("https://api.alternative.me/fng/");
      const data = await response.json();
      return {
        value: data.data[0].value,
        value_classification: data.data[0].value_classification,
      };
    } catch (error) {
      throw new Error(
        `Failed to get today's fear and greed index: ${error.message}`
      );
    }
  }

  generateSignal(data) {
    let color;
    let effect;
    let message = `Crypto Market Status: ${data.value_classification} (${data.value}/100)`;

    if (data.value_classification === "Extreme Fear") {
      color = "#FF0000"; // red
      effect = "BLINK";
    } else if (data.value_classification === "Fear") {
      color = "#FF6600"; // orange
      effect = "BLINK";
    } else if (data.value_classification === "Neutral") {
      color = "#FFDD00"; // yellow
      effect = "SET_COLOR";
    } else if (data.value_classification === "Greed") {
      color = "#66CC33"; // green
      effect = "BLINK";
    } else if (data.value_classification === "Extreme Greed") {
      color = "#00FF00"; // bright green
      effect = "SET_COLOR";
    } else {
      color = "#000000"; // fallback black
      effect = "SET_COLOR";
    }
    return new q.Signal({
      points: [[new q.Point(color, effect)]],
      name: "Crypto FNG Index",
      message: message,
    });
  }

  async run() {
    cryptoFNGIndex = await this.getCryptoFNGIndex();
    return this.generateSignal();
  }
}

module.exports = { CryptoFNGIndex: CryptoFNGIndex };
const applet = new CryptoFNGIndex();

if (require.main === module) {
  const applet = new CryptoFNGIndex();

  applet
    .getCryptoFNGIndex()
    .then((result) => {
      console.log("✅ Fetched FNG Index:\n", result);

      const signal = applet.generateSignal(result);
      console.log("✅ Generated Signal:\n", JSON.stringify(signal, null, 2));
    })
    .catch((error) => {
      console.error("❌ Error:", error.message);
    });
}
