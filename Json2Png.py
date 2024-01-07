import numpy as np
import matplotlib.pyplot as plt
import random
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate-track')
def generate_track():

    def adjust_points(x1, y1, x2, y2, step):
        """根据两个点的距离，调整点的数量"""
        distance = np.sqrt((x1[-1] - x2[0])**2 + (y1[-1] - y2[0])**2)

        if distance > 4/3 * step:
            # 在两点间添加一个点
            x_new = (x1[-1] + x2[0]) / 2
            y_new = (y1[-1] + y2[0]) / 2
            
            x1 = np.append(x1, x_new)
            y1 = np.append(y1, y_new)
        elif distance < 1 * step:
            # 删除一个点，从x2, y2中删除第一个点
            x2 = np.delete(x2, 0)
            y2 = np.delete(y2, 0)
            
        return x1, y1, x2, y2


    def plot_ellipse(step =12, rotate = -4 , length = 95 , r = 95 / np.pi + 17 , circle_center=(153, 160), extra_line=False):
        cx, cy = circle_center
        # 上直线
        x1 = np.arange((cx-length/2), (cx+length/2), step)
        y1_offset = np.random.uniform(-1, 1, x1.shape)
        y1 = cy + r + y1_offset

        if extra_line:
            x_length=len(x1)
            x_index_new=random.randint(0,x_length-1)
            extra_num=random.randint(3,6)

            x1_extra = np.arange(x1[x_index_new-1]-step/2*extra_num, x1[x_index_new-1], step/2 + random.uniform(-2,2))
            y1_extra_offset = np.random.uniform(0, 2, x1_extra.shape)
            y1_extra_start = cy + r
            # signal = 1 
            # 根据斜率和起始点计算y1_extra的值
            # y1_extra = y1_extra_start + signal*(np.random.uniform(0.2,0.8,x1_extra.shape)) * (x1_extra - x1_extra[len(x1_extra)-1]) +y1_extra_offset
            ra=random.random()
            if ra < 0.4:
                extra_num=random.randint(2,4)
                slope_randoms = np.random.uniform(-0.1, 0, x1_extra.shape[0] - 1) 
            elif ra < 0.7:
                extra_num=random.randint(7,11)
                # slope_randoms = np.random.uniform(-0.5 , 1.5, x1_extra.shape[0] - 1)
                # 定义样本数量的一半
                half_samples = (x1_extra.shape[0] - 1) // 5
                samples1 = np.random.uniform(-0.3, 0, half_samples)
                samples2 = np.random.uniform(0.5, 1.2, x1_extra.shape[0] - 1 - half_samples)
                # 组合结果
                slope_randoms = np.concatenate([samples1, samples2])
                # 随机打乱结果数组
                np.random.shuffle(slope_randoms)
            else:
                extra_num=random.randint(4,7)
                slope_randoms = np.random.uniform(0.5, 0.8, x1_extra.shape[0] - 1) 

            # 初始化y1_extra数组
            y1_extra = np.zeros_like(x1_extra)
            y1_extra[len(x1_extra) - 1] = y1_extra_start + y1_extra_offset[len(x1_extra) - 1]

            # 计算除了第一个点之外的y1_extra点
            for i in range(len(x1_extra) - 2, -1, -1 ):
                # 获取当前点和前一个点之间的斜率
                slope = slope_randoms[i - 1]
                # 应用斜率和其他计算来确定y1_extra的当前值
                y1_extra[i] = y1_extra[i+1] + slope * (x1_extra[i] - x1_extra[i+1]) + y1_extra_offset[i]

            # 设置y1_extra的第一个点
            y1_extra[i+1] += y1_extra_offset[i+1]
            
            x1 = np.concatenate([x1_extra,x1[x_index_new:x_length]])
            y1 = np.concatenate([y1_extra,y1[x_index_new:x_length]])


        # 右半圆
        theta2 = np.arange(np.pi/2, -np.pi/2, -step/r)
        x2 = r * np.cos(theta2) + cx + length/2
        y2 = r * np.sin(theta2) + cy

        x1, y1, x2, y2 = adjust_points(x1, y1, x2, y2, step)

        # 下直线
        x3 = np.arange(cx+length/2, (cx-length/2), -step)
        y3_offset = np.random.uniform(-2, 2, x3.shape)
        y3 = cy - r + y3_offset

        x2, y2, x3, y3 = adjust_points(x2, y2, x3, y3, step)

        # 左半圆
        theta1 = np.arange(1.5*np.pi, 0.5*np.pi, -step/r)
        x4 = r * np.cos(theta1) + cx-length/2
        y4 = r * np.sin(theta1) + cy

        x3, y3, x4, y4 = adjust_points(x3, y3, x4, y4, step)

        # 合并坐标
        x = np.concatenate([x1, x2, x3, x4])
        y = np.concatenate([y1, y2, y3, y4])

        angle_rad = np.deg2rad(rotate)
        rotation_matrix = np.array([
            [np.cos(angle_rad), -np.sin(angle_rad)],
            [np.sin(angle_rad), np.cos(angle_rad)]
        ])

        x = x - circle_center[0]
        y = y - circle_center[1]
        rotated_points = np.dot(rotation_matrix, np.array([x, y]))
        x_rotated = rotated_points[0] + circle_center[0]
        y_rotated = rotated_points[1] + circle_center[1]

        return x_rotated, y_rotated



    step = 12 + 2 * (2*random.random()-1)
    length = 95
    r = (length / np.pi + 18) + 1 * -1.5*(2*random.random()-1)  # 更改半径
    circle_center = (153, 160 + 1 * 1.5*(2*random.random()-1))  # 更改圆心


    all_x_rotated = []
    all_y_rotated = []
    for i in range(3):
        step = 12 + 2 * (2*random.random()-1)
        rotate = -4 + random.uniform(-0.5,0)  # 旋转角度
        length = 95
        r = (length / np.pi + 17) + (i-2) * -1.5*(2*random.random()-1)  # 更改半径
        circle_center = (153, 160 + (i-2) * 1.5*(2*random.random()-1))  # 更改圆心

        x_rotated, y_rotated = plot_ellipse(step, rotate, length, r, circle_center)
        # 添加坐标到大列表中
        all_x_rotated.extend(x_rotated)
        all_y_rotated.extend(y_rotated)

    end_x = []
    end_y = []
    for i in range(2):
        step = 12 + 2 * (2*random.random()-1)
        rotate = -4 + random.uniform(-0.5,0)  # 旋转角度
        length = 95
        r = (length / np.pi + 17) + (i-2) * -1.5*(2*random.random()-1)  # 更改半径
        circle_center = (153, 160 + (i-2) * 1.5*(2*random.random()-1))  # 更改圆心

        x_rotated, y_rotated = plot_ellipse(step, rotate, length, r, circle_center)
        # 添加坐标到大列表中
        end_x.extend(x_rotated)
        end_y.extend(y_rotated)

    end_index=random.randint((len(end_x)-1)//2,len(end_x)-1)
    end_x=end_x[0:end_index]
    end_y=end_y[0:end_index]
    all_x_rotated.extend(end_x)
    all_y_rotated.extend(end_y)

    x_extra_line, y_extra_line = plot_ellipse(extra_line=True)
    all_x_rotated=np.concatenate([x_extra_line, all_x_rotated])
    all_y_rotated=np.concatenate([y_extra_line, all_y_rotated])

    # 中心对称，50%的概率
    if random.random() < 0.5:
        all_y_rotated = [circle_center[1] - (y - circle_center[1]) for y in all_y_rotated]
        all_x_rotated = [circle_center[0] - (x - circle_center[0]) for x in all_x_rotated]



    # plt.figure(figsize=(10, 5))
    # plt.plot(all_x_rotated, all_y_rotated, '-o')
    # plt.title('Combined 400m Tracks (Rotated with Center Parameter)')
    # plt.xlabel('X (m)')
    # plt.ylabel('Y (m)')
    # plt.grid(True)
    # plt.axis('equal')
    # plt.show()

    actions = ['down'] + ['move'] * (len(all_x_rotated) - 2) + ['up']
    data = {
        'action': actions,
        'x': all_x_rotated,
        'y': all_y_rotated
    }
    data_list = [{'action': a, 'x': x_val, 'y': y_val}
                for a, x_val, y_val in zip(data['action'], data['x'], data['y'])]

    return jsonify(data_list)

if __name__ == "__main__":
    app.run()