# Whale Pet V0.2 — 原图轮廓与立体材质修订

现有 Figma：https://www.figma.com/design/aWj8wKmVFVCfLjJfddQwgf

## 本次修订

1. 根据原图的彩色边界拟合闭合贝塞尔轮廓，恢复身体内外弧线及厚薄关系。
2. 恢复原图的尾根弧度、上翘尾鳍和倾斜内孔，保留尾巴独立图层。
3. 恢复原图喷水的双分支弧度和高光边缘。
4. 保留原图渐变、高光、深蓝暗边与玻璃珠眼睛。
5. Idle、Blink、Happy、Thinking、Sleep、Reading 六种状态共用校正后的身体轮廓。
6. 身体与尾巴连接区域预留少量材质重叠，降低拆层产生的抗锯齿细缝。
7. 开心、思考、睡眠三个表情图标放大 60%，增强小尺寸下的辨识度。

## 文件

- comparison.html / comparison.png：原图、上一版、本次修订的对照。
- comparison-detail.png：精简的三图对照。
- whale-pet-character-sheet.svg / .png：六状态总览。
- whale-pet-idle / blink / happy / thinking / sleep / reading.svg：独立状态。
- 对应同名 PNG：512 × 512，透明背景，可直接用于效果参考。
- whale-pet-editable-contours.svg：纯矢量的身体、尾巴、喷水与眼睛轮廓。

## 材质与可编辑性

本次优先忠实保留用户原图的视觉：
**可编辑矢量轮廓 + 内嵌原图 PNG 材质**，并非所有高光都重新画成矢量渐变。

SVG 是自包含文件，不依赖外部图片。
body / tail / spout / eye 各自独立；表情符号位于 expression。
原图有阴影与白色背景，本次将主体背景透明化，投影通过 SVG 滤镜重建；
因此不声称与原图逐像素相同。
保真材质为栅格，放大清晰度以原始 1254 × 1254 图片为上限。

轮廓母版沿用 1254 × 1254 坐标；导出的展示尺寸为 512 × 512。
建议后续动画旋转中心：tail 约 (919, 812)，spout 约 (577, 400)，eye 约 (410, 690)。
这些为建议转轴，尚未构建骨骼或状态机。

## 导入 Figma

将所需 SVG 或六状态总览 SVG 拖入 Figma。
可编辑轮廓单独提供，便于后续制作纯矢量渐变版本。
如导入后阴影与本地预览不同，以同名 PNG 为外观参考；Figma 的 SVG 滤镜导入结果仍待验证。
对于 512 px 母版，可先尝试 X 3、Y 7、Blur 10、Opacity 30% 的投影，再与 PNG 对照调整。

## Figma 同步状态

本次修订尚未写入现有 Figma 文件：
- Figma MCP 提示 Starter 调用额度用尽。
- Computer Use 无法可靠确认当前浏览器 URL，已停止界面操作。
Figma 中仍是此前保存的原图对照及五种扁平状态，不能将其当作 V0.2。

## 验证

已在 Chromium 中检查六状态渲染、透明背景、高光边缘、尾根连接及对照排版。
纯矢量轮廓另以 1254 px 栅格化与提取出的参考遮罩对照。

