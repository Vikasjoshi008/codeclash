module.exports = (code, input) => `
#include <stdio.h>
#include <stdlib.h>

${code}

int main() {
    int nums[] = {${input.nums.join(",")}};
    int target = ${input.target};
    int returnSize;

    int* result = solve(nums, ${input.nums.length}, target, &returnSize);

    for (int i = 0; i < returnSize; i++) {
        printf("%d ", result[i]);
    }

    return 0;
}
`;
