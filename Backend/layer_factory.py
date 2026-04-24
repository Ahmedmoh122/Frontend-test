import json
import torch.nn as nn

# تحميل الـ JSON مرة واحدة
with open("layers_registry.json", "r") as f:
    layers_registry = json.load(f)

def create_layer(node_type: str, params: dict):
    if node_type not in layers_registry:
        raise ValueError(f"Layer {node_type} not supported.")
    
    # جلب الـ class من torch.nn
    layer_class = getattr(nn, node_type)
    
    # إنشاء الـ Layer بالـ params
    return layer_class(**params)
