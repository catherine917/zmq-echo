#!/usr/bin/python
import numpy as np
import cloudpickle as cp

sample = np.random.zipf(2, 10)
print(sample)
for i in range(10):
    print(sample[i])
msg = b'127.0.0.1:anna:1000'
msg = cp.load(msg)
print(msg)