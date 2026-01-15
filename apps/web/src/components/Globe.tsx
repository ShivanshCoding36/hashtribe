import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
    z: number;
    baseX: number;
    baseY: number;
    baseZ: number;
    isContinent: boolean;
}

interface Hotspot {
    lat: number;
    lng: number;
    label: string;
}

interface Arc {
    start: Hotspot;
    end: Hotspot;
}

interface GlobeProps {
    className?: string;
}

export function Globe({ className = '' }: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const rotationRef = useRef({ x: 0.8, y: 0.4 });
    const velocityRef = useRef({ x: -0.0008, y: 0.0002 }); // Negative x for clockwise
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const radius = Math.min(width, height) * 0.44;
        const points: Point[] = [];
        const count = 6000;

        const isLand = (phi: number, theta: number) => {
            const lat = (phi - Math.PI / 2) * (180 / Math.PI);
            const lng = ((theta * (180 / Math.PI) + 180) % 360) - 180;

            const nAmerica = (lng > -168 && lng < -52 && lat > 7 && lat < 75);
            const sAmerica = (lng > -81 && lng < -34 && lat > -56 && lat < 12);
            const africa = (lng > -18 && lng < 52 && lat > -35 && lat < 38);
            const eurasia = (lng > -12 && lng < 190 && lat > 10 && lat < 78);
            const sEAsia = (lng > 90 && lng < 150 && lat > -10 && lat < 25);
            const australia = (lng > 113 && lng < 154 && lat > -44 && lat < -10);
            const greenland = (lng > -75 && lng < -10 && lat > 60 && lat < 85);

            const medSea = (lng > -5 && lng < 45 && lat > 28 && lat < 45);
            const gulfMex = (lng > -100 && lng < -80 && lat > 18 && lat < 30);
            const hudsonBay = (lng > -95 && lng < -75 && lat > 50 && lat < 70);
            const indianOceanGap = (lng > 55 && lng < 100 && lat > -40 && lat < 15);

            let basicLand = nAmerica || sAmerica || africa || eurasia || sEAsia || australia || greenland;

            if (medSea || gulfMex || hudsonBay) basicLand = false;
            if (eurasia && indianOceanGap) basicLand = false;

            const noise = Math.sin(lng * 0.25) * Math.cos(lat * 0.25) +
                Math.sin(lng * 0.6) * 0.4 +
                Math.cos(lat * 0.8) * 0.3;

            return basicLand && noise > -0.4;
        };

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const continent = isLand(phi, theta);

            if (continent || Math.random() < 0.02) {
                const x = radius * Math.cos(theta) * Math.sin(phi);
                const y = radius * Math.sin(theta) * Math.sin(phi);
                const z = radius * Math.cos(phi);
                points.push({ x, y, z, baseX: x, baseY: y, baseZ: z, isContinent: continent });
            }
        }

        const hotspots: Hotspot[] = [
            { lat: 40.71, lng: -74.00, label: "NYC" },
            { lat: 34.05, lng: -118.24, label: "LA" },
            { lat: 51.50, lng: -0.12, label: "LON" },
            { lat: 35.67, lng: 139.65, label: "TKY" },
            { lat: -33.86, lng: 151.20, label: "SYD" },
            { lat: 1.35, lng: 103.81, label: "SGP" },
            { lat: -23.55, lng: -46.63, label: "SP" },
            { lat: 28.61, lng: 77.20, label: "DEL" },
            { lat: 31.23, lng: 121.47, label: "SHA" },
            // Additional Indian cities
            { lat: 19.07, lng: 72.87, label: "BOM" }, // Mumbai
            { lat: 12.97, lng: 77.59, label: "BLR" }, // Bangalore
            { lat: 13.08, lng: 80.27, label: "MAA" }, // Chennai
            // Additional Asian cities
            { lat: 37.56, lng: 126.97, label: "SEL" }, // Seoul
            { lat: 25.03, lng: 121.56, label: "TPE" }, // Taipei
            { lat: 22.39, lng: 114.10, label: "HKG" }, // Hong Kong
            // Additional European cities
            { lat: 48.85, lng: 2.35, label: "PAR" }, // Paris
            { lat: 52.52, lng: 13.40, label: "BER" }, // Berlin
            { lat: 55.75, lng: 37.61, label: "MOS" }, // Moscow
            // Additional American cities
            { lat: 43.65, lng: -79.38, label: "TOR" }, // Toronto
            { lat: 19.43, lng: -99.13, label: "MEX" }, // Mexico City
            // Middle East
            { lat: 25.27, lng: 55.29, label: "DXB" }, // Dubai
        ];

        const arcs: Arc[] = [
            // Original connections
            { start: hotspots[0], end: hotspots[2] }, // NYC - LON
            { start: hotspots[1], end: hotspots[3] }, // LA - TKY
            { start: hotspots[2], end: hotspots[7] }, // LON - DEL
            { start: hotspots[3], end: hotspots[4] }, // TKY - SYD
            { start: hotspots[5], end: hotspots[8] }, // SGP - SHA
            { start: hotspots[0], end: hotspots[6] }, // NYC - SP
            // Indian network
            { start: hotspots[7], end: hotspots[9] }, // DEL - BOM
            { start: hotspots[9], end: hotspots[10] }, // BOM - BLR
            { start: hotspots[10], end: hotspots[11] }, // BLR - MAA
            { start: hotspots[7], end: hotspots[10] }, // DEL - BLR
            // Asian network
            { start: hotspots[8], end: hotspots[12] }, // SHA - SEL
            { start: hotspots[12], end: hotspots[3] }, // SEL - TKY
            { start: hotspots[8], end: hotspots[14] }, // SHA - HKG
            { start: hotspots[5], end: hotspots[14] }, // SGP - HKG
            { start: hotspots[13], end: hotspots[3] }, // TPE - TKY
            // European network
            { start: hotspots[2], end: hotspots[15] }, // LON - PAR
            { start: hotspots[15], end: hotspots[16] }, // PAR - BER
            { start: hotspots[16], end: hotspots[17] }, // BER - MOS
            // Trans-continental
            { start: hotspots[0], end: hotspots[18] }, // NYC - TOR
            { start: hotspots[1], end: hotspots[19] }, // LA - MEX
            { start: hotspots[7], end: hotspots[20] }, // DEL - DXB
            { start: hotspots[20], end: hotspots[2] }, // DXB - LON
        ];

        const handleMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                const deltaX = e.clientX - lastMouseRef.current.x;
                const deltaY = e.clientY - lastMouseRef.current.y;

                // Update velocity based on drag
                velocityRef.current.x = deltaX * 0.005;
                velocityRef.current.y = deltaY * 0.005;

                lastMouseRef.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            canvas.style.cursor = 'grab';
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        const project = (lat: number, lng: number, r: number, cosX: number, sinX: number, cosY: number, sinY: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);

            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.cos(phi);
            let z = r * Math.sin(phi) * Math.sin(theta);

            let x1 = x * cosX - z * sinX;
            let z1 = x * sinX + z * cosX;
            let y2 = y * cosY - z1 * sinY;
            let z2 = y * sinY + z1 * cosY;

            return { x: x1, y: y2, z: z2 };
        };

        let frame: number;
        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            time += 0.012;

            rotationRef.current.x += velocityRef.current.x;
            rotationRef.current.y += velocityRef.current.y;
            // Apply damping only when not dragging
            if (!isDraggingRef.current) {
                velocityRef.current.x *= 0.985;
                velocityRef.current.y *= 0.985;
                velocityRef.current.x += -0.0004; // Negative for clockwise
            }

            const cosX = Math.cos(rotationRef.current.x);
            const sinX = Math.sin(rotationRef.current.x);
            const cosY = Math.cos(rotationRef.current.y);
            const sinY = Math.sin(rotationRef.current.y);

            ctx.save();
            ctx.translate(width / 2, height / 2);

            const baseGradient = ctx.createRadialGradient(0, 0, radius * 0.85, 0, 0, radius);
            baseGradient.addColorStop(0, '#000000');
            baseGradient.addColorStop(0.9, '#050505');
            baseGradient.addColorStop(1, '#111111');

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = baseGradient;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            points.forEach(p => {
                let x1 = p.baseX * cosX - p.baseZ * sinX;
                let z1 = p.baseX * sinX + p.baseZ * cosX;
                let y2 = p.baseY * cosY - z1 * sinY;
                let z2 = p.baseY * sinY + z1 * cosY;

                if (z2 > -radius * 0.5) {
                    const alpha = Math.max(0, (z2 + radius) / (2 * radius));
                    const opacity = p.isContinent ? (0.8 * alpha) : (0.15 * alpha);
                    const size = p.isContinent ? 0.75 : 0.4;

                    ctx.beginPath();
                    ctx.arc(x1, y2, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                }
            });

            // Enhanced Hotspots with multiple pulse rings
            hotspots.forEach(hs => {
                const p = project(hs.lat, hs.lng, radius, cosX, sinX, cosY, sinY);
                if (p.z > 0) {
                    const pulse = Math.sin(time * 3.5) * 0.5 + 0.5;

                    // Outer expanding ring
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 8 + pulse * 8, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - pulse * 0.15})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Middle ring
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 5 + pulse * 5, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - pulse * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Glow around center
                    const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
                    glowGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`);
                    glowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.3 + pulse * 0.3})`);
                    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = glowGradient;
                    ctx.fill();

                    // Bright center core
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
                    ctx.fill();
                }
            });

            arcs.forEach(arc => {
                const p1 = project(arc.start.lat, arc.start.lng, radius, cosX, sinX, cosY, sinY);
                const p2 = project(arc.end.lat, arc.end.lng, radius, cosX, sinX, cosY, sinY);

                // Only draw if BOTH points are on the visible front side
                if (p1.z > 0 && p2.z > 0) {
                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;
                    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                    // Draw solid arc line
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.quadraticCurveTo(midX * 1.15, midY - dist * 0.35, p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            });
            ctx.setLineDash([]);

            ctx.restore();
            frame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(frame);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}
            style={{ background: 'transparent' }}
        />
    );
}
