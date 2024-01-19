# Discreet Fourier transform


$$
\begin{bmatrix}  
\hat{f_1} \\  
\hat{f_2} \\
\hat{f_3} \\
... \\
\hat{f_n}
\end{bmatrix}

=

\begin{bmatrix}  
1 & 1 & 1 & ... & 1\\  
1 & w_n & w_n^2 & ... & w_n^{n-1}\\
1 & w^2_n &  w_n^4 & ... & w_n^{2(n-1)}\\
... & ... & ... & ... & ...\\
1 & w_n^{n-1} & w_n^{2(n-1)} & ... & w_n^{(n-1)^2}
\end{bmatrix}

\begin{bmatrix}  
f_1 \\  
f_2 \\
f_3 \\
... \\
f_n
\end{bmatrix}
$$
$$
w_n = e^{-2j \pi / n}
$$