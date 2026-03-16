/**
 * SVG 工具函数模块
 * 提供极坐标转换、路径生成等工具函数
 */

/**
 * 数值修约工具（用于坐标精度控制）
 */
const round10 = (value, exp) => {
    let type = 'round';
    if (typeof exp === 'undefined' || +exp === 0) return Math[type](value);
    value = +value; exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) return NaN;
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
};

/**
 * 极坐标转笛卡尔坐标
 * @param {number} centerX - 中心点 X 坐标
 * @param {number} centerY - 中心点 Y 坐标
 * @param {number} radius - 半径
 * @param {number} angleInDegrees - 角度（度）
 * @returns {{x: number, y: number}} 笛卡尔坐标
 */
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

export const SVGUtil = {
    /**
     * 安全数值转换
     * @param {*} numberVal - 输入值
     * @param {number} numberDefault - 默认值
     * @returns {number} 转换后的数值
     */
    Numeric: (numberVal, numberDefault = 0) => {
        return isNaN(numberVal) || numberVal === null || numberVal === undefined ? numberDefault : Number(numberVal);
    },

    /**
     * 路径生成工具
     */
    path: {
        /**
         * 生成圆环路径（双环）
         * @param {number} x - 中心 X
         * @param {number} y - 中心 Y
         * @param {number} radius - 内环半径
         * @param {number} width - 环宽度
         * @returns {string} SVG path 数据
         */
        donut: (x, y, radius, width) => {
            x = Number(x || 0); y = Number(y || 0);
            radius = Number(radius || 0); width = Number(width || 0);
            const innerRing = {
                start: polarToCartesian(x, y, radius, 359.99),
                end: polarToCartesian(x, y, radius, 0)
            };
            const outerRing = {
                start: polarToCartesian(x, y, radius + width, 359.99),
                end: polarToCartesian(x, y, radius + width, 0)
            };
            return [
                "M", innerRing.start.x, innerRing.start.y,
                "A", radius, radius, 0, 1, 0, innerRing.end.x, innerRing.end.y,
                "M", outerRing.start.x, outerRing.start.y,
                "A", radius + width, radius + width, 0, 1, 0, outerRing.end.x, outerRing.end.y
            ].join(" ");
        },

        /**
         * 生成弧形路径（支持箭头）
         * @param {number} x - 中心 X
         * @param {number} y - 中心 Y
         * @param {number} radius - 半径
         * @param {number} startAngle - 起始角度
         * @param {number} endAngle - 结束角度
         * @param {number} width - 宽度
         * @param {object} arrowStart - 箭头起始参数
         * @param {object} arrowEnd - 箭头结束参数
         * @returns {string} SVG path 数据
         */
        arc: (x, y, radius, startAngle, endAngle, width, arrowStart = {width: 0, length: 0, angle: 0}, arrowEnd = {width: 0, length: 0, angle: 0}) => {
            x = Number(x); y = Number(y); radius = Number(radius);
            startAngle = Number(startAngle); endAngle = Number(endAngle); width = Number(width);

            if (startAngle === endAngle) {
                const start = polarToCartesian(x, y, radius, startAngle);
                const end = polarToCartesian(x, y, radius + width, startAngle);
                return ["M", start.x, start.y, "L", end.x, end.y].join(" ");
            }

            if (width === 1) {
                const start = polarToCartesian(x, y, radius, startAngle);
                const end = polarToCartesian(x, y, radius, endAngle);
                const arcSweep = (startAngle < endAngle ? endAngle - startAngle : endAngle - startAngle + 360) <= 180 ? "0" : "1";
                return ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 1, end.x, end.y].join(" ");
            }

            endAngle = endAngle - (arrowEnd.length < 0 ? 0 : arrowEnd.length);
            startAngle = startAngle + (arrowStart.length < 0 ? 0 : arrowStart.length);
            const start = polarToCartesian(x, y, radius, endAngle);
            const end = polarToCartesian(x, y, radius, startAngle);
            const arrow_start_1 = polarToCartesian(x, y, radius - arrowStart.width, startAngle + arrowStart.angle);
            const arrow_start_2 = polarToCartesian(x, y, radius + (width / 2), startAngle - arrowStart.length);
            const arrow_start_3 = polarToCartesian(x, y, radius + width + arrowStart.width, startAngle + arrowStart.angle);
            const arrow_start_4 = polarToCartesian(x, y, radius + width, startAngle);
            const arrow_end_1 = polarToCartesian(x, y, radius + width + arrowEnd.width, endAngle - arrowEnd.angle);
            const arrow_end_2 = polarToCartesian(x, y, radius + (width / 2), endAngle + arrowEnd.length);
            const arrow_end_3 = polarToCartesian(x, y, radius - arrowEnd.width, endAngle - arrowEnd.angle);
            const arrow_end_4 = polarToCartesian(x, y, radius, endAngle);
            const start2 = polarToCartesian(x, y, radius + width, endAngle);
            const arcSweep = (startAngle < endAngle ? endAngle - startAngle : endAngle - startAngle + 360) <= 180 ? "0" : "1";

            return ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y, "L", arrow_start_1.x, arrow_start_1.y, "L", arrow_start_2.x, arrow_start_2.y, "L", arrow_start_3.x, arrow_start_3.y, "L", arrow_start_4.x, arrow_start_4.y, "A", radius + width, radius + width, 0, arcSweep, 1, start2.x, start2.y, "L", arrow_end_1.x, arrow_end_1.y, "L", arrow_end_2.x, arrow_end_2.y, "L", arrow_end_3.x, arrow_end_3.y, "L", arrow_end_4.x, arrow_end_4.y, "z"].join(" ");
        },

        /**
         * 生成刻度路径
         * @param {number} x - 中心 X
         * @param {number} y - 中心 Y
         * @param {number} radius - 半径
         * @param {number} interval - 刻度间隔
         * @param {number} total - 总长度
         * @param {number} tickLength - 刻度长度
         * @returns {string} SVG path 数据
         */
        scale: (x, y, radius, interval, total, tickLength) => {
            x = Number(x || 0); y = Number(y || 0); radius = Number(radius || 0);
            interval = Number(interval || 0); total = Number(total || 0); tickLength = Number(tickLength || 2);
            const numTicks = interval > 0 ? total / interval : 0;
            const beta = 2 * Math.PI / numTicks;
            let d = '';
            for (let i = 0; i < numTicks; i += 1) {
                const alpha = beta * i - Math.PI / 2;
                const cos = Math.cos(alpha); const sin = Math.sin(alpha);
                d += `M${round10(x + radius * cos, -1)},${round10(y + radius * sin, -1)} L${round10(x + (radius + tickLength) * cos, -1)},${round10(y + (radius + tickLength) * sin, -1)} `;
            }
            return d || "M 0,0";
        }
    },

    /**
     * 元素生成工具
     */
    element: {
        /**
         * 生成刻度标签
         * @param {number} x - 中心 X
         * @param {number} y - 中心 Y
         * @param {number} radius - 半径
         * @param {number} interval - 刻度间隔
         * @param {number} total - 总长度
         * @returns {Array<{x: number, y: number, text: number}>} 标签数组
         */
        scaleLabels: (x, y, radius, interval, total) => {
            x = Number(x); y = Number(y); radius = Number(radius);
            interval = Number(interval); total = Number(total);
            const numTicks = interval > 0 ? total / interval : 0;
            const beta = 2 * Math.PI / numTicks;
            const labelArr = [];
            for (let i = 0; i < numTicks; i += 1) {
                const alpha = beta * i - Math.PI / 2;
                labelArr.push({
                    x: round10(x + radius * Math.cos(alpha), -1),
                    y: round10(y + radius * Math.sin(alpha), -1),
                    text: interval * i
                });
            }
            return labelArr;
        }
    }
};