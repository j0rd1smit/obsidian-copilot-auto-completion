# Dead ReLU problem
A neuron is considered dead if it does not activate for any of the training instance in the training dataset. Because it never activates it will never have a gradient due to the chain rule so it also cannot change anymore. The dead ReLU problem can have due to a wide variety of reasons, such as:
- 

This can be computational wasteful, since we still need to do the matrix multiplication, while it will never have an impact on the activations or gradients. It also reduces the learning capacity of the network, since it has to learn the same function with fewer neurons.

The gradient $\frac{dy}{dx} = 0$ if $x < 0$. This is no problem if it happens for some instance but it is a problem if it happens for all instances.