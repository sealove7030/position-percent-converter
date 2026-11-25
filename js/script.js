"use strict";

const fields = {
  width: document.querySelector("#parentWidth"),
  height: document.querySelector("#parentHeight"),
  left: document.querySelector("#leftPx"),
  top: document.querySelector("#topPx"),
  right: document.querySelector("#rightPx"),
  bottom: document.querySelector("#bottomPx"),
};

const outputs = {
  left: [document.querySelector("#leftResult"), document.querySelector("#leftFormula")],
  top: [document.querySelector("#topResult"), document.querySelector("#topFormula")],
  right: [document.querySelector("#rightResult"), document.querySelector("#rightFormula")],
  bottom: [document.querySelector("#bottomResult"), document.querySelector("#bottomFormula")],
};

const errorMessage = document.querySelector("#errorMessage");
const cssOutput = document.querySelector("#cssOutput");
const copyButton = document.querySelector("#copyButton");

const read = (input) => input.value.trim() === "" ? null : Number(input.value);
const round = (value) => Number(value.toFixed(2));
const percentText = (value) => `${round(value)}%`;

function calculate() {
  const values = Object.fromEntries(
    Object.entries(fields).map(([key, input]) => [key, read(input)])
  );
  const positiveKeys = ["width", "height"];
  let invalid = false;

  Object.entries(fields).forEach(([key, input]) => {
    const value = values[key];
    const bad = value !== null && (
      !Number.isFinite(value) ||
      (positiveKeys.includes(key) ? value <= 0 : value < 0)
    );
    input.setAttribute("aria-invalid", String(bad));
    invalid ||= bad;
  });

  errorMessage.textContent = invalid
    ? "幅・高さは0より大きい数値、位置は0以上の数値を入力してください。"
    : "";

  const percentValues = {
    left: values.width > 0 && values.left !== null ? values.left / values.width * 100 : null,
    right: values.width > 0 && values.right !== null ? values.right / values.width * 100 : null,
    top: values.height > 0 && values.top !== null ? values.top / values.height * 100 : null,
    bottom: values.height > 0 && values.bottom !== null ? values.bottom / values.height * 100 : null,
  };

  Object.entries(percentValues).forEach(([key, percentage]) => {
    const [result, formula] = outputs[key];
    const axisSize = ["left", "right"].includes(key) ? values.width : values.height;
    const px = values[key];
    result.textContent = !invalid && percentage !== null ? percentText(percentage) : "—";
    formula.textContent = !invalid && percentage !== null
      ? `${px}px ÷ ${axisSize}px × 100`
      : `${["left", "right"].includes(key) ? "幅" : "高さ"}と${key}を入力`;
  });

  const hasPosition = Object.values(percentValues).some((value) => value !== null);
  if (!invalid && hasPosition) {
    const lines = [
      ".mainvisual {",
      "  position: relative;",
      "}",
      "",
      ".mainvisual-text {",
      "  position: absolute;",
    ];
    ["top", "right", "bottom", "left"].forEach((key) => {
      if (percentValues[key] !== null) {
        lines.push(`  ${key}: ${round(percentValues[key])}%;`);
      }
    });
    lines.push("}");
    cssOutput.textContent = lines.join("\n");
    copyButton.disabled = false;
  } else {
    cssOutput.textContent = "/* 数値を入力するとCSSを表示します */";
    copyButton.disabled = true;
  }

  copyButton.textContent = "CSSをコピー";
}

Object.values(fields).forEach((input) => input.addEventListener("input", calculate));

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(cssOutput.textContent);
    copyButton.textContent = "コピーしました";
  } catch {
    copyButton.textContent = "コードを選択してコピーしてください";
  }
  window.setTimeout(() => { copyButton.textContent = "CSSをコピー"; }, 1800);
});

calculate();
