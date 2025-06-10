from pgzrun import * # 导入pgzrun模块中的所有方法
TITLE = '跳舞的精灵'
WIDTH = 600 # 设置屏幕尺寸的宽
HEIGHT = 400 # 设置屏幕尺寸的高
bac= 'https://oss.aws.turingstar.com.cn/pvc-69686520-7d90-467b-a297-5dfdcce2b165/tmp/Delicate-1-60509/mk/20250219-160608.png'
jl = 'https://static.codeasily.net/blogs/pig1.png'
genie = Actor(jl)
genie.pos = 300,300
def draw():
 screen.clear()
 screen.blit(bac,(0,0))
 genie.draw()

def update():
 genie.x += 1
go()