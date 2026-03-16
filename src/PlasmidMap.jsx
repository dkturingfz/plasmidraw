import { useState, Component, useMemo } from 'react';
import { Plasmid, PlasmidTrack, TrackMarker, MarkerLabel, TrackScale, TrackLabel } from './lib';

/**
 * 将 CSS 字符串转换为 React style 对象
 * @param {string} str - CSS 字符串，如 "color:red;font-size:14px"
 * @returns {object} React style 对象
 */
function css(str) {
    if (!str || typeof str !== 'string') return {};
    const obj = {};
    str.split(';').forEach(rule => {
        const idx = rule.indexOf(':');
        if (idx < 0) return;
        const prop = rule.slice(0, idx).trim();
        const val = rule.slice(idx + 1).trim();
        if (!prop || !val) return;
        const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        obj[camel] = val;
    });
    return obj;
}

/**
 * 错误边界组件 - 捕获并显示渲染错误
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, message: String(error?.message ?? error) };
    }

    componentDidCatch(error, info) {
        console.error('[PlasmidMap 渲染错误]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '24px 32px', background: '#fff0f0',
                    border: '1px solid #ffcccc', borderRadius: 8,
                    color: '#c00', fontFamily: 'sans-serif',
                    maxWidth: 480, textAlign: 'center',
                }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>图谱渲染失败</div>
                    <div style={{ fontSize: 12, color: '#a00', wordBreak: 'break-all' }}>
                        {this.state.message}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, message: '' })}
                        style={{
                            marginTop: 16, padding: '6px 16px',
                            background: '#c00', color: '#fff',
                            border: 'none', borderRadius: 4, cursor: 'pointer',
                        }}
                    >重试</button>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Feature 悬浮提示组件
 */
function FeaturePopup({ feature, position }) {
    if (!feature) return null;
    const title = feature.name || feature.labels?.[0]?.text || feature.label || 'Feature';
    
    return (
        <div className="feature-popup" style={{
            top: position.y + 16,
            left: position.x + 16,
        }}>
            <div className="feature-popup-title">{title}</div>
            {feature.description && (
                <div className="feature-popup-description">
                    {feature.description}
                </div>
            )}
            {feature.details && (
                <div className="feature-popup-details">
                    {feature.details}
                </div>
            )}
            {feature.start != null && (
                <div className="feature-popup-location">
                    位置：{feature.start}
                    {feature.end != null ? ` – ${feature.end} bp` : ' bp'}
                    {feature.end != null && feature.end > feature.start &&
                        ` | 长度：${feature.end - feature.start} bp`}
                </div>
            )}
        </div>
    );
}

/**
 * 标准化数据格式 - 将输入数据转换为统一的 tracks 格式
 */
function normalize(data) {
    if (data.tracks) return data.tracks;
    
    const tsStr = data.trackStyle
        ? (typeof data.trackStyle === 'string'
            ? data.trackStyle
            : Object.entries(data.trackStyle).map(([k, v]) => `${k}:${v}`).join(';'))
        : '';
    
    return [{
        trackStyle: tsStr,
        radius: data.radius,
        width: data.width,
        labels: [
            { text: data.name, labelStyle: 'font-size:30px;font-weight:700' },
            { text: `${data.sequencelength} bp`, labelStyle: 'font-size:18px;font-weight:400', vadjust: 25 },
        ],
        scales: [{ interval: 500, showlabels: 1, labelvadjust: 20, labelstyle: 'font-size:12px' }],
        markers: (data.features ?? []).map(f => ({
            id: f.id, start: f.start, end: f.end,
            type: f.label || f.labels?.[0]?.text || f.id || f.type || 'unknown',
            markerStyle: f.style
                ? Object.entries(f.style).map(([k, v]) => `${k}:${v}`).join(';') : '',
            vadjust: f.vadjust, description: f.description, details: f.details,
            arrowstartlength: f.arrowstartlength, arrowstartwidth: f.arrowstartwidth,
            arrowstartangle: f.arrowstartangle, arrowendlength: f.arrowendlength,
            arrowendwidth: f.arrowendwidth, arrowendangle: f.arrowendangle,
            labels: [
                { text: f.label, vadjust: f.labelVadjust },
                ...(f.label2 ? [{ text: f.label2, vadjust: f.label2Vadjust, labelStyle: 'font-size:14px' }] : [])
            ],
        })),
    }];
}

/**
 * 质粒图谱主组件
 */
export default function PlasmidMap({ data }) {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const tracks = useMemo(() => normalize(data), [data]);

    return (
        <>
            <ErrorBoundary>
                <Plasmid
                    plasmidheight={data.size}
                    plasmidwidth={data.size}
                    sequencelength={data.sequencelength}
                >
                    {tracks.map((track, ti) => (
                        <PlasmidTrack
                            key={ti}
                            radius={track.radius}
                            width={track.width}
                            style={css(track.trackStyle)}
                        >
                            {track.labels?.map((lbl, i) => (
                                <TrackLabel
                                    key={i}
                                    text={lbl.text}
                                    vadjust={lbl.vadjust}
                                    style={css(lbl.labelStyle)}
                                />
                            ))}

                            {track.scales?.map((sc, i) => (
                                <TrackScale
                                    key={i}
                                    interval={sc.interval}
                                    direction={sc.direction}
                                    ticksize={sc.ticksize}
                                    showlabels={sc.showlabels}
                                    labelvadjust={sc.labelvadjust}
                                    vadjust={sc.vadjust}
                                    style={css(sc.style)}
                                    labelstyle={css(sc.labelstyle)}
                                />
                            ))}

                            {track.markers?.map(m => (
                                <TrackMarker
                                    key={m.id}
                                    start={m.start}
                                    end={m.end}
                                    vadjust={m.vadjust}
                                    wadjust={m.wadjust}
                                    arrowstartlength={m.arrowstartlength}
                                    arrowstartwidth={m.arrowstartwidth}
                                    arrowstartangle={m.arrowstartangle}
                                    arrowendlength={m.arrowendlength}
                                    arrowendwidth={m.arrowendwidth}
                                    arrowendangle={m.arrowendangle}
                                    style={{
                                        ...css(m.markerStyle),
                                        cursor: m.description ? 'pointer' : 'default',
                                    }}
                                    onMouseEnter={m.description ? e => {
                                        e.currentTarget.style.opacity = '0.7';
                                        setMousePos({ x: e.clientX, y: e.clientY });
                                        setSelectedFeature(m);
                                    } : undefined}
                                    onMouseMove={m.description ? e => {
                                        setMousePos({ x: e.clientX, y: e.clientY });
                                    } : undefined}
                                    onMouseLeave={m.description ? e => {
                                        e.currentTarget.style.opacity = '1';
                                        setSelectedFeature(null);
                                    } : undefined}
                                >
                                    {m.labels?.map((lbl, li) => (
                                        <MarkerLabel
                                            key={li}
                                            text={lbl.text}
                                            type={lbl.type}
                                            vadjust={lbl.vadjust}
                                            hadjust={lbl.hadjust}
                                            valign={lbl.valign}
                                            halign={lbl.halign}
                                            showline={lbl.showline ? '1' : '0'}
                                            linevadjust={lbl.linevadjust}
                                            style={css(lbl.labelStyle)}
                                        />
                                    ))}
                                </TrackMarker>
                            ))}
                        </PlasmidTrack>
                    ))}
                </Plasmid>
            </ErrorBoundary>

            <FeaturePopup
                feature={selectedFeature}
                position={mousePos}
            />
        </>
    );
}