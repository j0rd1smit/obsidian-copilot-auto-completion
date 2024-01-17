## Kadane's algorithm

Kadane's algorithm is an $O(n)$ solution to this problem.
The key idea is that for each element, we have only 2 choices:

- Add this element to the current subset.
- Start a new subset.

Due to this reasons, the problem can a viewed as a sliding window problem.

The general steps are as follows:

1. Initialize two variables, say `currentSum` and `maxSum`. Set both of them to the first element of the array.
2. Loop through from the 2nd to the last element in the array.
    1. Decide to include the current number or to start a new subset using: `currentSum = max(num, currentSum + num)`
    2. If the current value of the subset is the best so far update `maxSum`


```rust

```