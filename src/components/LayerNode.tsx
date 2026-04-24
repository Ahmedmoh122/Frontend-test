import { Handle, Position } from 'reactflow';
import { Card } from "./ui/card"; // تأكد من المسار صح بالنسبة لمكان الملف

export function LayerNode({ data }: any) {
  return (
    <Card className="bg-slate-900 border-blue-500/50 p-4 shadow-xl min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="text-center text-white">
        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{data.type}</p>
        <p className="text-sm font-bold">{data.label}</p>
        <div className="text-[10px] text-slate-400 mt-2">
          <p>Units: {data.params?.units || '64'}</p>
          <p>Act: {data.params?.activation || 'relu'}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </Card>
  );
}