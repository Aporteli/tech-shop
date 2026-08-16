import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./priceFilter.module.css";

export default function PriceFilter({ min = 0, max = 7169, onPriceChange }) {
  const [range, setRange] = useState([min, max]);

  // ინპუტებისთვის ცალკე State-ები, რომ თავისუფლად შეგეძლოს წაშლა/აკრეფა
  const [minInput, setMinInput] = useState(min.toString());
  const [maxInput, setMaxInput] = useState(max.toString());

  // სლაიდერის დათრევისას ვანახლებთ ინპუტების ტექსტსაც
  const handleSliderChange = (newValues) => {
    setRange(newValues);
    setMinInput(newValues[0].toString());
    setMaxInput(newValues[1].toString());
    if (onPriceChange) onPriceChange(newValues);
  };

  // "From" ინპუტში აკრეფისას
  const handleMinInputChange = (e) => {
    const valStr = e.target.value;
    setMinInput(valStr);

    if (valStr !== "") {
      const num = Number(valStr);
      if (num >= min && num <= range[1]) {
        const newRange = [num, range[1]];
        setRange(newRange);
        if (onPriceChange) onPriceChange(newRange);
      }
    }
  };

  // "To" ინპუტში აკრეფისას
  const handleMaxInputChange = (e) => {
    const valStr = e.target.value;
    setMaxInput(valStr);

    if (valStr !== "") {
      const num = Number(valStr);
      if (num >= range[0] && num <= max) {
        const newRange = [range[0], num];
        setRange(newRange);
        if (onPriceChange) onPriceChange(newRange);
      }
    }
  };

  // როცა მომხმარებელი ინპუტიდან კურსორს გადაიტანს (დაასრულებს აკრეფას)
  const handleBlur = () => {
    let currentMin = Number(minInput);
    let currentMax = Number(maxInput);

    // თუ ინპუტი ცარიელია ან საზღვრებს ცდება
    if (minInput === "" || currentMin < min) currentMin = min;
    if (maxInput === "" || currentMax > max) currentMax = max;

    // თუ From გახდა To-ზე მეტი, გავასწოროთ
    if (currentMin > currentMax) {
      currentMin = currentMax;
    }

    const finalRange = [currentMin, currentMax];
    setRange(finalRange);
    setMinInput(currentMin.toString());
    setMaxInput(currentMax.toString());
    if (onPriceChange) onPriceChange(finalRange);
  };

  return (
    <div className={styles.filterCard}>
      <h3 className={styles.title}>Price</h3>

      {/* სლაიდერი */}
      <div className={styles.sliderWrapper}>
        <Slider
          range
          min={min}
          max={max}
          value={range}
          onChange={handleSliderChange}
          styles={{
            track: { backgroundColor: "#7b42f6", height: 8 },
            rail: { backgroundColor: "#d8cbf5", height: 8 },
            handle: {
              borderColor: "#7b42f6",
              height: 24,
              width: 24,
              marginTop: -8,
              backgroundColor: "#ffffff",
              opacity: 1,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              borderWidth: 3,
            },
          }}
        />
      </div>

      {/* ინპუტები */}
      <div className={styles.inputsRow}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>From</label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={handleBlur}
            />
            <span className={styles.currency}>₾</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>To</label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={handleBlur}
            />
            <span className={styles.currency}>₾</span>
          </div>
        </div>
      </div>
    </div>
  );
}
