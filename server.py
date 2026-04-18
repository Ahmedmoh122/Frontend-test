from flask import Flask, request, jsonify
from Backend.layer_factory import create_layer

app = Flask(__name__)

@app.route("/create-layer", methods=["POST"])
def create_layer_endpoint():
    data = request.get_json()
    node_type = data["node_type"]
    params = data["params"]
    layer = create_layer(node_type, params)
    return jsonify({"layer": str(layer)})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
