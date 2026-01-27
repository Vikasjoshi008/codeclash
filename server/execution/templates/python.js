module.exports = (code, input) => `
${code}

try:
    data = ${JSON.stringify(input)}

    if isinstance(data, list):
        print(solve(*data))
    else:
        print(solve(data["nums"], data["target"]))
except Exception as e:
    print(e)
`;
