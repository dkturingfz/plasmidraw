import React, { createContext, useContext, useMemo, useCallback, useId } from 'react';
import { SVGUtil } from './svgUtil';

const DEFAULT_LINE_STYLE = { stroke: '#666', fill: 'none' };

const PlasmidContext = createContext(null);
const TrackContext = createContext(null);
const MarkerContext = createContext(null);

const usePlasmid = () => {
    const ctx = useContext(PlasmidContext);
    if (!ctx) throw new Error('<PlasmidTrack> or <TrackLabel> must be used inside <Plasmid>');
    return ctx;
};

const useTrack = () => {
    const ctx = useContext(TrackContext);
    if (!ctx) throw new Error('<TrackMarker>, <TrackScale>, and <TrackLabel> must be used inside <PlasmidTrack>');
    return ctx;
};

const useMarker = () => {
    const ctx = useContext(MarkerContext);
    if (!ctx) throw new Error('<MarkerLabel> must be used inside <TrackMarker>');
    return ctx;
};

export const Plasmid = ({ plasmidheight = 300, plasmidwidth = 300, sequencelength, sequence, className, style, children }) => {
    const height = SVGUtil.Numeric(plasmidheight, 300);
    const width = SVGUtil.Numeric(plasmidwidth, 300);
    
    const contextValue = useMemo(() => ({
        center: { x: width / 2, y: height / 2 },
        sequencelength: sequence ? sequence.length : SVGUtil.Numeric(sequencelength),
        sequence
    }), [width, height, sequencelength, sequence]);

    return (
        <PlasmidContext.Provider value={contextValue}>
            <svg viewBox={`0 0 ${width} ${height}`} height={height} width={width} className={className} style={style}>
                {children}
            </svg>
        </PlasmidContext.Provider>
    );
};

export const PlasmidTrack = ({ radius = 100, width = 25, className, style, onClick, children }) => {
    const plasmid = usePlasmid();
    const numRadius = SVGUtil.Numeric(radius, 100);
    const numWidth = SVGUtil.Numeric(width, 25);

    const d = useMemo(() => SVGUtil.path.donut(plasmid.center.x, plasmid.center.y, numRadius, numWidth), [plasmid.center, numRadius, numWidth]);
    
    const trackContextValue = useMemo(() => ({ 
        center: plasmid.center, 
        sequencelength: plasmid.sequencelength, 
        radius: numRadius, 
        width: numWidth 
    }), [plasmid.center, plasmid.sequencelength, numRadius, numWidth]);

    return (
        <TrackContext.Provider value={trackContextValue}>
            <g>
                <path d={d} fillRule="evenodd" className={className} style={style} onClick={onClick} />
                {children}
            </g>
        </TrackContext.Provider>
    );
};

export const TrackMarker = ({ 
    start, end, vadjust = 0, wadjust = 0, 
    arrowstartlength, arrowstartwidth, arrowstartangle, 
    arrowendlength, arrowendwidth, arrowendangle, 
    className, style, onClick, onMouseEnter, onMouseLeave, children 
}) => {
    const track = useTrack();
    const numStart = SVGUtil.Numeric(start);
    const numEnd = SVGUtil.Numeric(end ?? start);
    const numV = SVGUtil.Numeric(vadjust);
    const numW = SVGUtil.Numeric(wadjust);

    const markerData = useMemo(() => {
        const inner = track.radius + numV;
        const outer = track.radius + numV + track.width + numW;
        const middle = track.radius + numV + (track.width + numW) / 2;
        const sA = (numStart / track.sequencelength) * 360;
        let eA = (numEnd / track.sequencelength) * 360;
        if (eA < sA) eA += 360;
        return { radius: { inner, outer, middle }, width: track.width + numW, angle: { start: sA, middle: sA + (eA - sA) / 2, end: eA } };
    }, [track.radius, track.width, track.sequencelength, numStart, numEnd, numV, numW]);

    const getPosition = useCallback((hAdj, vAdj, hAlign, vAlign) => {
        const r = vAlign === "inner" ? markerData.radius.inner + vAdj : vAlign === "outer" ? markerData.radius.outer + vAdj : markerData.radius.middle + vAdj;
        const a = hAlign === "start" ? markerData.angle.start + hAdj : hAlign === "end" ? markerData.angle.end + hAdj : markerData.angle.middle + hAdj;
        return SVGUtil.polarToCartesian(track.center.x, track.center.y, r, a);
    }, [markerData, track.center]);

    const markerContextValue = useMemo(() => ({ ...markerData, center: track.center, getPosition }), [markerData, track.center, getPosition]);

    const d = useMemo(() => {
        const aS = { width: SVGUtil.Numeric(arrowstartwidth), length: SVGUtil.Numeric(arrowstartlength), angle: SVGUtil.Numeric(arrowstartangle) };
        const aE = { width: SVGUtil.Numeric(arrowendwidth), length: SVGUtil.Numeric(arrowendlength), angle: SVGUtil.Numeric(arrowendangle) };
        return SVGUtil.path.arc(track.center.x, track.center.y, markerData.radius.inner, markerData.angle.start, markerData.angle.end, markerData.width, aS, aE);
    }, [track.center, markerData, arrowstartlength, arrowstartwidth, arrowstartangle, arrowendlength, arrowendwidth, arrowendangle]);

    return (
        <MarkerContext.Provider value={markerContextValue}>
            <g>
                <path 
                    d={d} 
                    className={className} 
                    style={style} 
                    onClick={onClick}
                    onMouseEnter={onMouseEnter}   
                    onMouseLeave={onMouseLeave}   
                />
                {children}
            </g>
        </MarkerContext.Provider>
    );
};

export const MarkerLabel = ({ 
    text, type, valign = "middle", vadjust = 0, halign = "middle", hadjust = 0, 
    showline = "0", linevadjust = 0, linestyle, lineclass, 
    className, style, onClick 
}) => {
    const marker = useMarker();
    const pathId = useId();
    const hAdj = SVGUtil.Numeric(hadjust);
    const vAdj = SVGUtil.Numeric(vadjust);
    const numLineV = SVGUtil.Numeric(linevadjust);
    
    const pos = useMemo(() => 
        type !== 'path' ? marker.getPosition(hAdj, vAdj, halign, valign) : null,
    [type, marker.getPosition, hAdj, vAdj, halign, valign]);

    const linePath = useMemo(() => {
        if (showline !== "1") return null;
        const src = marker.getPosition(hAdj, vAdj + numLineV, halign, valign);
        const dstV = valign === "inner" ? marker.radius.inner : valign === "middle" ? marker.radius.middle : marker.radius.outer;
        const dstA = halign === "start" ? marker.angle.start : halign === "end" ? marker.angle.end : marker.angle.middle;
        const dst = SVGUtil.polarToCartesian(marker.center.x, marker.center.y, dstV, dstA);
        return `M ${src.x} ${src.y} L ${dst.x} ${dst.y}`;
    }, [showline, marker.getPosition, marker.radius, marker.angle, marker.center, hAdj, vAdj, numLineV, halign, valign]);

    const textPathD = useMemo(() => {
        if (type !== 'path') return null;
        const r = (valign === "inner" ? marker.radius.inner : valign === "outer" ? marker.radius.outer : marker.radius.middle) + vAdj;
        const sA = halign === "start" ? marker.angle.start : halign === "end" ? marker.angle.end + 1 : marker.angle.middle + 180.05;
        const eA = halign === "start" ? marker.angle.start + 359.99 : halign === "end" ? marker.angle.end : marker.angle.middle + 179.95;
        return SVGUtil.path.arc(marker.center.x, marker.center.y, r, sA + hAdj, eA + hAdj, 1);
    }, [type, marker.center, marker.radius, marker.angle, valign, halign, vAdj, hAdj]);

    return (
        <g>
            {linePath && (
                <path 
                    d={linePath} 
                    className={lineclass} 
                    style={linestyle ?? (!lineclass ? DEFAULT_LINE_STYLE : undefined)} 
                />
            )}
            {type === 'path' ? (
                <>
                    <path id={pathId} d={textPathD} fill="none" stroke="none" />
                    <text className={className} style={style} onClick={onClick}>
                        <textPath 
                            href={`#${pathId}`} 
                            startOffset={halign === 'start' ? "0%" : halign === 'end' ? "100%" : "50%"} 
                            textAnchor={halign === 'start' ? "start" : halign === 'end' ? "end" : "middle"}
                        >
                            {text}
                        </textPath>
                    </text>
                </>
            ) : (
                <text x={pos?.x} y={pos?.y} textAnchor="middle" dominantBaseline="middle" className={className} style={style} onClick={onClick}>{text}</text>
            )}
        </g>
    );
};

export const TrackScale = ({ 
    interval, vadjust = 0, ticksize = 3, direction = 'out', 
    showlabels = "0", labelvadjust = 15, labelclass, labelstyle, 
    className, style, onClick 
}) => {
    const track = useTrack();
    const inward = direction === 'in';
    const numV = SVGUtil.Numeric(vadjust);
    const numTick = SVGUtil.Numeric(ticksize, 3);
    const numInt = SVGUtil.Numeric(interval);
    const numLabelV = SVGUtil.Numeric(labelvadjust, 15);
    
    const sRadius = (inward ? track.radius : track.radius + track.width) + (inward ? -1 : 1) * numV + (inward ? -numTick : 0);

    const d = useMemo(() => 
        SVGUtil.path.scale(track.center.x, track.center.y, sRadius, numInt, track.sequencelength, numTick),
    [track.center, track.sequencelength, sRadius, numInt, numTick]);
    
    const labels = useMemo(() => {
        if (showlabels !== "1") return [];
        return SVGUtil.element.scaleLabels(track.center.x, track.center.y, sRadius + numLabelV * (inward ? -1 : 1), numInt, track.sequencelength);
    }, [showlabels, track.center, track.sequencelength, sRadius, numLabelV, inward, numInt]);

    return (
        <g>
            <path d={d} className={className} style={style} onClick={onClick} />
            {labels.map((lbl) => (
                <text 
                    key={lbl.text} 
                    x={lbl.x} y={lbl.y} 
                    textAnchor="middle" dominantBaseline="middle" 
                    className={labelclass} style={labelstyle} onClick={onClick}
                >
                    {lbl.text}
                </text>
            ))}
        </g>
    );
};

export const TrackLabel = ({ text, hadjust = 0, vadjust = 0, className, style, onClick }) => {
    const track = useTrack();
    const x = track.center.x + SVGUtil.Numeric(hadjust);
    const y = track.center.y + SVGUtil.Numeric(vadjust);
    return <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={className} style={style} onClick={onClick}>{text}</text>;
};

export const TrackMarkerGroup = ({ className, style, children, ...props }) => (
    <g className={className} style={style} {...props}>{children}</g>
);

export const SVGElement = ({ type: Component = 'g', children, ...props }) => (
    <Component {...props}>{children}</Component>
);