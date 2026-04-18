import { useState } from "react";

export default function LayerForm() {
  const [nodeType, setNodeType] = useState("Conv2d");
  const [inChannels, setInChannels] = useState(3);
  const [outChannels, setOutChannels] = useState(16);
  const [kernelSize, setKernelSize] = useState(3);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const jsonData = {
      node_type: nodeType,
      params: {}
    };

    // إضافة الـ Params حسب نوع الـ Layer
    if (nodeType === "Conv2d") {
      jsonData.params = {
        in_channels: inChannels,
        out_channels: outChannels,
        kernel_size: kernelSize
      };
    } else if (nodeType === "Linear") {
      jsonData.params = {
        in_features: inChannels,
        out_features: outChannels
      };
    } else if (nodeType === "Softmax") {
      jsonData.params = { dim: 1 };
    } else if (nodeType === "Dropout") {
      jsonData.params = { p: 0.5 };
    } else if (nodeType === "Flatten") {
      jsonData.params = { start_dim: 1, end_dim: -1 };
    } else {
      // باقي الـ Activations زي ReLU و GELU مش محتاجين Params
      jsonData.params = {};
    }

    const response = await fetch("http://localhost:5000/create-layer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    setResult(data.layer); // نخزن النتيجة في state
  };

  return (
    <div>
      <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
        <option value="Conv2d">Conv2d</option>
        <option value="Linear">Linear</option>
        <option value="ReLU">ReLU</option>
        <option value="GELU">GELU</option>
        <option value="Softmax">Softmax</option>
        <option value="Dropout">Dropout</option>
        <option value="Flatten">Flatten</option>
      </select>

      {/* الحقول الخاصة بالـ Conv2d و Linear */}
      {(nodeType === "Conv2d" || nodeType === "Linear") && (
        <>
          <input
            type="number"
            value={inChannels}
            onChange={(e) => setInChannels(Number(e.target.value))}
            placeholder="in_channels / in_features"
          />
          <input
            type="number"
            value={outChannels}
            onChange={(e) => setOutChannels(Number(e.target.value))}
            placeholder="out_channels / out_features"
          />
        </>
      )}

      {/* الحقل الخاص بالـ kernel_size في Conv2d */}
      {nodeType === "Conv2d" && (
        <input
          type="number"
          value={kernelSize}
          onChange={(e) => setKernelSize(Number(e.target.value))}
          placeholder="kernel_size"
        />
      )}

      <button onClick={handleSubmit}>Add Layer</button>

      {/* عرض النتيجة تحت الفورم */}
      {result && <p>Layer created: {result}</p>}
    </div>
  );
}
