module.exports = (code, input) => `
#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    vector<int> nums = {${input.nums.join(",")}};
    int target = ${input.target};

    vector<int> result = solve(nums, target);

    for (int x : result) {
        cout << x << " ";
    }

    return 0;
}
`;
