from pgzrun import *

# 设置窗口大小
WIDTH = 800
HEIGHT = 600

# 创建一个小球对象
ball = Actor('https://static.codeasily.net/blogs/pig1.png', center=(WIDTH // 2, HEIGHT // 2))
ball.speed_x = 0  # 水平速度
ball.speed_y = 0  # 垂直速度

# 设置小球的速度
BALL_SPEED = 5

def draw():
    """绘制游戏画面"""
    screen.fill((0, 0, 0))  # 清空屏幕，填充黑色
    ball.draw()  # 绘制小球

def update():
    """更新游戏状态"""
    # 如果球静止，给它一个初始速度
    if ball.speed_x == 0 and ball.speed_y == 0:
        ball.speed_x = BALL_SPEED
        ball.speed_y = BALL_SPEED

    # 更新小球的位置
    ball.x += ball.speed_x
    ball.y += ball.speed_y

    # 检查边界碰撞
    if ball.x < 0 or ball.x > WIDTH:
        ball.speed_x = -ball.speed_x  # 反弹
    if ball.y < 0 or ball.y > HEIGHT:
        ball.speed_y = -ball.speed_y  # 反弹

def on_key_down(key):
    """处理键盘按下事件"""
    global ball
    if key == keys.LEFT:
        ball.speed_x = -BALL_SPEED
    elif key == keys.RIGHT:
        ball.speed_x = BALL_SPEED
    elif key == keys.UP:
        ball.speed_y = -BALL_SPEED
    elif key == keys.DOWN:
        ball.speed_y = BALL_SPEED

def on_key_up(key):
    """处理键盘释放事件"""
    if key in (keys.LEFT, keys.RIGHT):
        ball.speed_x = 0
    elif key in (keys.UP, keys.DOWN):
        ball.speed_y = 0

# 运行游戏
go()