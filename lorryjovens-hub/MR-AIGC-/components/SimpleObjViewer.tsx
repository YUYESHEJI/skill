import React, { useEffect, useRef, useState, useMemo } from 'react';

interface SimpleObjViewerProps {
    objData: string;
}

const SimpleObjViewer: React.FC<SimpleObjViewerProps> = ({ objData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState({ x: 0.2, y: 0.5 }); // Initial slight tilt
    const [isDragging, setIsDragging] = useState(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // Parse and Normalize Geometry
    const mesh = useMemo(() => {
        const vertices: number[][] = [];
        const faces: number[][] = [];
        const lines = objData.split('\n');
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'v') {
                vertices.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (parts[0] === 'f') {
                // Handle various OBJ face formats: f v1 v2 v3 or f v1/vt1/vn1 ...
                const faceIndices = parts.slice(1).map(p => {
                    const indexStr = p.split('/')[0];
                    return parseInt(indexStr) - 1; // OBJ is 1-based
                });
                // Only support faces with valid indices
                if (faceIndices.every(idx => !isNaN(idx))) {
                    faces.push(faceIndices);
                }
            }
        }

        if (vertices.length === 0) return { vertices: [], faces: [] };

        // Normalize Vertices to fit in [-1, 1] range
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        vertices.forEach(v => {
            minX = Math.min(minX, v[0]); minY = Math.min(minY, v[1]); minZ = Math.min(minZ, v[2]);
            maxX = Math.max(maxX, v[0]); maxY = Math.max(maxY, v[1]); maxZ = Math.max(maxZ, v[2]);
        });

        const maxRange = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        const normalizedVertices = vertices.map(v => [
            (v[0] - centerX) / (maxRange * 0.5), // Scale to roughly [-1, 1]
            (v[1] - centerY) / (maxRange * 0.5),
            (v[2] - centerZ) / (maxRange * 0.5)
        ]);

        return { vertices: normalizedVertices, faces };
    }, [objData]);

    // Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        
        // Clear
        ctx.fillStyle = '#0f1123'; // Dark background matches theme
        ctx.fillRect(0, 0, width, height);
        
        // Settings
        ctx.strokeStyle = '#00f0ff'; // mvx-accent
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';

        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.35; // Zoom factor

        // Rotation Function
        const rotate = (v: number[], r: { x: number, y: number }) => {
            let [x, y, z] = v;
            
            // Rotate around Y axis (horizontal drag)
            let tx = x * Math.cos(r.y) - z * Math.sin(r.y);
            let tz = x * Math.sin(r.y) + z * Math.cos(r.y);
            x = tx;
            z = tz;

            // Rotate around X axis (vertical drag)
            let ty = y * Math.cos(r.x) - z * Math.sin(r.x);
            tz = y * Math.sin(r.x) + z * Math.cos(r.x);
            y = ty;
            z = tz;

            return [x, y, z];
        };

        // Draw Mesh
        ctx.beginPath();
        mesh.faces.forEach(face => {
            const projectedPoints = face.map(idx => {
                const v = mesh.vertices[idx];
                if (!v) return null;

                const rv = rotate(v, rotation);
                
                // Simple Weak Perspective Projection
                // 2D x = 3D x
                // 2D y = 3D y (inverted for canvas)
                // We add a fake "depth" to make it look 3D
                const zDist = 4; 
                const persp = zDist / (zDist - rv[2]); 
                
                const px = cx + rv[0] * scale * persp;
                const py = cy - rv[1] * scale * persp;
                
                return [px, py];
            });

            if (projectedPoints.length > 0 && projectedPoints.every(p => p !== null)) {
                const start = projectedPoints[0]!;
                ctx.moveTo(start[0], start[1]);
                for (let i = 1; i < projectedPoints.length; i++) {
                    const p = projectedPoints[i]!;
                    ctx.lineTo(p[0], p[1]);
                }
                ctx.lineTo(start[0], start[1]); // Close face
            }
        });
        ctx.stroke();

        // Draw HUD / Grid floor for reference
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // A simple floor grid logic could go here, but keeping it clean for now.

    }, [mesh, rotation]);

    // Mouse Interactions
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        
        setRotation(prev => ({
            x: prev.x + dy * 0.01,
            y: prev.y + dx * 0.01
        }));
        
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <canvas 
            ref={canvasRef}
            width={600} 
            height={400}
            className="w-full h-full cursor-move block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            title="Drag to rotate"
        />
    );
};

export default SimpleObjViewer;