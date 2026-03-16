import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * 导出功能组件 - 支持 SVG、PNG、PDF 格式
 */
export default function ExportButtons({ svgRef, filename, onClose }) {
    const baseName = filename ? filename.replace(/\.json$/i, '') : 'plasmid';

    /**
     * 获取 SVG 元素
     */
    const getSvgElement = () => {
        if (svgRef && svgRef.current) {
            return svgRef.current;
        }
        return document.querySelector('.plasmid-wrapper svg');
    };

    /**
     * 导出为 SVG 格式
     */
    const exportSVG = async () => {
        try {
            const svgElement = getSvgElement();
            if (!svgElement) {
                alert('未找到图谱');
                return;
            }
            
            const svgData = svgElement.outerHTML;
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${baseName}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            onClose?.();
        } catch (error) {
            console.error('导出 SVG 失败:', error);
            alert('导出失败：' + error.message);
        }
    };

    /**
     * 导出为 PNG 格式
     */
    const exportPNG = async () => {
        try {
            const svgElement = getSvgElement();
            if (!svgElement) {
                alert('未找到图谱');
                return;
            }

            const dataUrl = await toPng(svgElement, {
                quality: 1.0,
                pixelRatio: 2,
                style: { background: '#ffffff' }
            });
            
            const link = document.createElement('a');
            link.download = `${baseName}.png`;
            link.href = dataUrl;
            link.click();
            
            onClose?.();
        } catch (error) {
            console.error('导出 PNG 失败:', error);
            alert('导出失败：' + error.message);
        }
    };

    /**
     * 导出为 PDF 格式
     */
    const exportPDF = async () => {
        try {
            const svgElement = getSvgElement();
            if (!svgElement) {
                alert('未找到图谱');
                return;
            }

            const svgRect = svgElement.getBoundingClientRect();
            const svgWidth = parseFloat(svgElement.getAttribute('width')) || svgRect.width;
            const svgHeight = parseFloat(svgElement.getAttribute('height')) || svgRect.height;

            const pdf = new jsPDF({
                orientation: svgWidth > svgHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const padding = 40;
            const availableWidth = pdfWidth - padding * 2;
            const availableHeight = pdfHeight - padding * 2;
            const scale = Math.min(availableWidth / svgWidth, availableHeight / svgHeight, 1);
            
            const finalWidth = svgWidth * scale;
            const finalHeight = svgHeight * scale;
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            const dataUrl = await toPng(svgElement, {
                quality: 1.0,
                pixelRatio: 2,
                style: { background: '#ffffff' }
            });

            pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`${baseName}.pdf`);
            
            onClose?.();
        } catch (error) {
            console.error('导出 PDF 失败:', error);
            alert('导出失败：' + error.message);
        }
    };

    return (
        <>
            <button className="dropdown-item" onClick={exportSVG}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                </svg>
                SVG 格式
            </button>
            <button className="dropdown-item" onClick={exportPNG}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                PNG 图片
            </button>
            <button className="dropdown-item" onClick={exportPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                PDF 文档
            </button>
        </>
    );
}