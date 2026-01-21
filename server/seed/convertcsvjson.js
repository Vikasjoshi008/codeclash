const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

const csvFilePath = path.join(__dirname, "leetcode.csv");
const jsonFilePath = path.join(__dirname, "leetcode.json");

csv()
  .fromFile(csvFilePath)
  .then(jsonArray => {
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(jsonArray, null, 2)
    );
    console.log("✅ CSV converted to JSON successfully");
  })
  .catch(err => {
    console.error("❌ CSV conversion failed", err);
  });
