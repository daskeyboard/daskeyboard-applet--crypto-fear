const { CryptoFNGIndex } = require("../index");
const q = require("daskeyboard-applet");
const fetch = require("node-fetch");

jest.mock("node-fetch", () => jest.fn());

describe("CryptoFNGIndex", () => {
  let applet;

  beforeEach(() => {
    applet = new CryptoFNGIndex();
  });

  describe("getCryptoFNGIndex", () => {
    it("fetches and parses the Crypto Fear and Greed index", async () => {
      const mockResponse = {
        data: [
          {
            value: "42",
            value_classification: "Neutral",
          },
        ],
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await applet.getCryptoFNGIndex();
      expect(result).toEqual({
        value: "42",
        value_classification: "Neutral",
      });
    });

    it("throws an error on fetch failure", async () => {
      fetch.mockRejectedValue(new Error("Network failure"));

      await expect(applet.getCryptoFNGIndex()).rejects.toThrow(
        "Failed to get today's fear and greed index: Network failure"
      );
    });
  });

  describe("generateSignal", () => {
    it("generates correct signal for Extreme Fear", () => {
      const inputData = {
        value: "10",
        value_classification: "Extreme Fear",
      };

      const signal = applet.generateSignal(inputData);

      expect(signal).toBeInstanceOf(q.Signal);
      expect(signal.points[0][0].color).toBe("#FF0000");
      expect(signal.points[0][0].effect).toBe("BLINK");
      expect(signal.message).toBe(
        "Crypto Market Status: Extreme Fear (10/100)"
      );
    });

    it("generates correct signal for Fear", () => {
      const inputData = {
        value: "30",
        value_classification: "Fear",
      };

      const signal = applet.generateSignal(inputData);

      expect(signal).toBeInstanceOf(q.Signal);
      expect(signal.points[0][0].color).toBe("#FF6600");
      expect(signal.points[0][0].effect).toBe("BLINK");
      expect(signal.message).toBe("Crypto Market Status: Fear (30/100)");
    });

    it("generates correct signal for Neutral", () => {
      const inputData = {
        value: "50",
        value_classification: "Neutral",
      };

      const signal = applet.generateSignal(inputData);

      expect(signal).toBeInstanceOf(q.Signal);
      expect(signal.points[0][0].color).toBe("#FFDD00");
      expect(signal.points[0][0].effect).toBe("BLINK");
      expect(signal.message).toBe("Crypto Market Status: Neutral (50/100)");
    });

    it("generates correct signal for Greed", () => {
      const inputData = {
        value: "70",
        value_classification: "Greed",
      };

      const signal = applet.generateSignal(inputData);

      expect(signal).toBeInstanceOf(q.Signal);
      expect(signal.points[0][0].color).toBe("#66CC33");
      expect(signal.points[0][0].effect).toBe("BLINK");
      expect(signal.message).toBe("Crypto Market Status: Greed (70/100)");
    });

    it("generates correct signal for Extreme Greed", () => {
      const inputData = {
        value: "90",
        value_classification: "Extreme Greed",
      };

      const signal = applet.generateSignal(inputData);

      expect(signal).toBeInstanceOf(q.Signal);
      expect(signal.points[0][0].color).toBe("#00FF00");
      expect(signal.points[0][0].effect).toBe("BLINK");
      expect(signal.message).toBe(
        "Crypto Market Status: Extreme Greed (90/100)"
      );
    });
  });
});
