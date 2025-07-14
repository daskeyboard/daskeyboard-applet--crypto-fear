const q = require("daskeyboard-applet");
const fetch = require("node-fetch");
const logger = q.logger;

class CryptoFNGIndex extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60 * 10 * 1000; // updates once every 10 minutes

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
    let effect = "SET_COLOR";
    let message = `Crypto Market Status: ${data.value_classification} (${data.value}/100)`;

    if (data.value_classification === "Extreme Fear") {
      color = "#FF0000"; // red
    } else if (data.value_classification === "Fear") {
      color = "#FF6600"; // orange
    } else if (data.value_classification === "Neutral") {
      color = "#FFDD00"; // yellow
    } else if (data.value_classification === "Greed") {
      color = "#66CC33"; // green
    } else {
      color = "#00FF00"; // bright green
    }
    return new q.Signal({
      points: [[new q.Point(color, effect)]],
      name: "Crypto FNG Index",
      message: message,
    });
  }

  async run() {
    const cryptoFNGIndex = await this.getCryptoFNGIndex();
    return this.generateSignal(cryptoFNGIndex);
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
