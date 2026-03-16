import { useState, useCallback, useRef } from 'react';
import Toolbar from './components/Toolbar';
import PlasmidMap from './PlasmidMap';
import './styles/main.css';

/**
 * 主应用组件
 */
export default function App() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [filename, setFilename] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loadKey, setLoadKey] = useState(0);
    const svgRef = useRef(null);

    /**
     * 解析 JSON 文件
     */
    const parseFile = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                setFilename(file.name);
                setError(null);
                setLoadKey(k => k + 1);
                setData(json);
            } catch {
                setError('JSON 格式错误，请检查文件');
                setData(null);
            }
        };
        reader.readAsText(file);
    }, []);

    const handleFile = (e) => parseFile(e.target.files[0]);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); parseFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => {
        const related = e.relatedTarget;
        if (!related || !e.currentTarget.contains(related)) setIsDragging(false);
    };

    return (
        <div className="app-container">
            <Toolbar 
                onFileSelect={handleFile}
                hasData={!!data}
                svgRef={svgRef}
                filename={filename}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                isDragging={isDragging}
            />

            <div className="main-content">
                <div className="content-area">
                    {error && (
                        <div className="error-banner">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {data && (
                        <div className="plasmid-container">
                            <div className="plasmid-wrapper" ref={svgRef}>
                                <PlasmidMap 
                                    key={loadKey} 
                                    data={data} 
                                />
                            </div>
                        </div>
                    )}

                    {!data && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📂</div>
                            <div className="empty-state-text">请上传质粒图谱 JSON 文件</div>
                            <div className="empty-state-hint">支持拖拽文件或点击工具栏"打开文件"按钮</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}