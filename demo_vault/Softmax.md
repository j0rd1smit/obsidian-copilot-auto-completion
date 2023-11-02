# Softmax
The softmax function transforms a vector into a probability distribution such that the sum of the vector is equal to 1.

$$

$$

## Numerical stability improvements

### Rescaling exponent

Due to the exponent operation, it is very likely that you get $\infty$ values.
You can prevent this by ensuring that the largest possible exponent is $0$.
This is typically implement by finding the maximum value and then subtracting it:

```python
def softmax(x, dim=-1):  
    c = x.max()  
    return torch.exp(x - c) / torch.exp(x - c).sum(dim=dim, keepdim=True)
```

## Calculating the log of the softmax

Calculating the log of the softmax can be numerically unstable so it is better to use the log-softmax approach.
