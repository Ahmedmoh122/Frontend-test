from Backend.layer_factory import create_layer

layer = create_layer("Conv2d", {
    "in_channels": 3,
    "out_channels": 16,
    "kernel_size": 3
})
print(layer)
