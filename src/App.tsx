import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
  Panel,
  ReactFlowInstance
} from 'reactflow';
// @ts-ignore
import 'reactflow/dist/style.css';
import * as signalR from "@microsoft/signalr";

// استيراد المكونات
import { LayerNode } from './components/LayerNode';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const nodeTypes = { layer: LayerNode };

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [metrics, setMetrics] = useState<{epoch: number, loss: number, acc: number}[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 1. ربط SignalR (Task 2)
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/trainingHub")
      .withAutomaticReconnect()
      .build();

    connection.start().catch(err => console.error("SignalR Error: ", err));
    connection.on("ReceiveMetrics", (m) => setMetrics(prev => [...prev, m]));

    return () => { connection.stop(); };
  }, []);

  // 2. تحديث البيانات (حل مشكلة التعليق والحرف الواحد)
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const updateNodeData = (field: string, value: any) => {
    if (!selectedNodeId) return;
    
    setNodes((nds) => nds.map((node) => {
      if (node.id === selectedNodeId) {
        if (field === 'label') {
          return { ...node, data: { ...node.data, label: value } };
        }
        const finalValue = field === 'units' ? Number(value) : value;
        return {
          ...node,
          data: { ...node.data, params: { ...node.data.params, [field]: finalValue } }
        };
      }
      return node;
    }));
  };

  // 3. منطق السحب والرمي (Task 1)
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;
    
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode = {
      id: `${Date.now()}`,
      type: 'layer',
      position,
      data: { label: `${type} Layer`, type, params: { units: 64, activation: 'relu' } },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance]);

  return (
    <div className="dark w-full h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - الأيسر */}
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary italic">DL Studio</h2>
        <Separator />
        <div className="flex flex-col gap-2">
          {['CONV2D', 'LINEAR', 'DROPOUT'].map(l => (
            <div key={l} onDragStart={(e) => onDragStart(e, l)} draggable className="cursor-grab">
              <Button variant="secondary" className="w-full justify-start pointer-events-none mb-1">{l}</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas - المنتصف */}
      <div className="flex-1 relative bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(c) => setNodes((nds) => applyNodeChanges(c, nds))}
          onEdgesChange={(c) => setEdges((eds) => applyEdgeChanges(c, eds))}
          onConnect={(p) => setEdges((eds) => addEdge(p, eds))}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#334155" gap={20} />
          <Controls />
          <Panel position="top-right">
            <Card className="p-3 bg-card/90 backdrop-blur w-44 text-[10px]">
              <h3 className="font-bold text-primary mb-1 uppercase text-[9px]">Live Training Metrics</h3>
              {metrics.length > 0 ? (
                <div className="flex justify-between">
                  <span className="text-green-400">Acc: {metrics[metrics.length-1].acc.toFixed(3)}</span>
                  <span className="text-red-400">Loss: {metrics[metrics.length-1].loss.toFixed(3)}</span>
                </div>
              ) : <div>Waiting for SignalR...</div>}
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel - الأيمن */}
      <div className="w-72 border-l border-border bg-card p-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-primary">Properties</h2>
        <Separator />
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Layer Name</Label>
              <Input 
                type="text"
                value={selectedNode.data.label} 
                onChange={(e) => updateNodeData('label', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Units / Filters</Label>
              <Input 
                type="number"
                value={selectedNode.data.params.units} 
                onChange={(e) => updateNodeData('units', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Activation</Label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-1 text-sm mt-1"
                value={selectedNode.data.params.activation}
                onChange={(e) => updateNodeData('activation', e.target.value)}
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="softmax">Softmax</option>
              </select>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic text-center mt-10">Select a layer to edit</p>
        )}
      </div>
    </div>
  );
}