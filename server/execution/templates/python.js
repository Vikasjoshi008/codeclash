module.exports = (code, input) => `
${code}

try:
    data = ${JSON.stringify(input)}

    # Reverse Integer (dict with key "x")
    if isinstance(data, dict) and "x" in data:
        print(solve(data["x"]))

    # Single integer input
    elif isinstance(data, int):
        print(solve(data))

    # List input (e.g., Two Sum style)
    elif isinstance(data, list):
        print(solve(*data))

    # Object input (nums + target)
    elif isinstance(data, dict) and "nums" in data and "target" in data:
        print(solve(data["nums"], data["target"]))

    else:
        raise Exception("Invalid input format")

except Exception as e:
    print(e)
`;
