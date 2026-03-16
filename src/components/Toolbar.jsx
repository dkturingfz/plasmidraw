import { useState } from 'react';
import ExportButtons from './ExportButtons';

/**
 * 顶部工具栏组件
 */
export default function Toolbar({ 
    onFileSelect, 
    hasData, 
    svgRef, 
    filename, 
    onDrop, 
    onDragOver, 
    onDragEnter, 
    onDragLeave, 
    isDragging 
}) {
    const [isExportOpen, setIsExportOpen] = useState(false);

    /**
     * 打开文件选择对话框
     */
    const handleFileClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && onFileSelect) {
                onFileSelect(file);
            }
        };
        input.click();
    };

    return (
        <header className="toolbar">
            <div className="toolbar-left">
                <div className="toolbar-title">
                    <span className="toolbar-title-icon">🧬</span>
                    <span>PlasimDraw</span>
                </div>
            </div>
            
            <div className="toolbar-right">
                {/* 上传区域 - 支持拖拽和点击 */}
                <div
                    className={`toolbar-upload ${isDragging ? 'dragging' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onClick={handleFileClick}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className="upload-text">
                        {isDragging ? '松开上传' : '打开文件'}
                    </span>
                </div>
                
                {/* 文件名显示 */}
                {filename && (
                    <div className="filename-badge">
                        <span>📄</span>
                        <span>{filename}</span>
                    </div>
                )}
                
                {/* 导出菜单 */}
                {hasData && (
                    <div className="dropdown">
                        <button 
                            className="btn" 
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            onBlur={() => setTimeout(() => setIsExportOpen(false), 200)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>导出</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        
                        {isExportOpen && (
                            <div className="dropdown-menu">
                                <ExportButtons 
                                    svgRef={svgRef}
                                    filename={filename}
                                    onClose={() => setIsExportOpen(false)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}