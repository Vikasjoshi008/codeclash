module.exports = (code, input) => `
${code}

try {
  const data = ${JSON.stringify(input)};

  if (Array.isArray(data)) {
    solve(...data);
  } else {
    solve(data.nums, data.target);
  }
} catch (err) {
  console.error(err.message);
}
`;
