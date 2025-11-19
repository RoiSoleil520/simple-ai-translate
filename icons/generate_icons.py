#!/usr/bin/env python3
"""
图标生成脚本
使用 PIL (Pillow) 库生成浏览器扩展所需的图标
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("请运行: pip install Pillow")
    exit(1)

def create_icon(size):
    """创建指定尺寸的图标"""
    # 创建图像
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变背景（简化版，使用纯色）
    # 从 #667eea 到 #764ba2 的中间色
    bg_color = (106, 101, 206)  # 紫色
    draw.rectangle([0, 0, size, size], fill=bg_color)
    
    # 绘制圆形边框（地球）
    line_width = max(2, size // 16)
    padding = size // 4
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        outline='white',
        width=line_width
    )
    
    # 绘制横线
    middle = size // 2
    draw.line(
        [padding, middle, size - padding, middle],
        fill='white',
        width=line_width
    )
    
    # 绘制竖线（椭圆）
    ellipse_width = size // 8
    draw.ellipse(
        [middle - ellipse_width, padding, middle + ellipse_width, size - padding],
        outline='white',
        width=line_width
    )
    
    # 绘制文字 "A"
    try:
        font_size = size // 3
        # 尝试使用系统字体
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
        
        text = "A"
        # 获取文字边界框
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # 居中绘制文字
        text_x = (size - text_width) // 2 - bbox[0]
        text_y = (size - text_height) // 2 - bbox[1]
        draw.text((text_x, text_y), text, fill='white', font=font)
    except Exception as e:
        print(f"警告: 绘制文字时出错: {e}")
    
    return img

def main():
    """生成所有尺寸的图标"""
    sizes = [16, 48, 128]
    
    for size in sizes:
        print(f"正在生成 {size}x{size} 图标...")
        img = create_icon(size)
        filename = f"icon{size}.png"
        img.save(filename)
        print(f"✅ 已保存: {filename}")
    
    print("\n🎉 所有图标生成完成！")
    print("请确保将这些图标文件放在 icons 文件夹中。")

if __name__ == "__main__":
    main()

