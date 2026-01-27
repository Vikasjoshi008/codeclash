module.exports = (code, input) => `
using System;
using System.Linq;

class Program {
${code}

    static void Main() {
        int[] nums = new int[] { ${input.nums.join(",")} };
        int target = ${input.target};

        int[] result = Solve(nums, target);

        Console.WriteLine(string.Join(" ", result));
    }
}
`;
