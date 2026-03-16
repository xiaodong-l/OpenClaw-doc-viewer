#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
OpenClaw Doc Viewer - 国内社媒自动化发布脚本

使用 Playwright 浏览器自动化 + Cookies 保存
模拟人工操作发布到各平台

支持平台:
- 微博
- 知乎
- 掘金
- B 站动态
- V2EX
- 开源中国

使用方式:
1. 首次运行：python china_social_auto.py --login
2. 发布内容：python china_social_auto.py --release "v1.4.0" "https://github.com/..."

依赖:
pip install playwright
playwright install
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
import argparse

from playwright.async_api import async_playwright, Browser, BrowserContext, Page


class SocialMediaBot:
    """国内社媒自动化发布机器人"""

    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.cookies_dir = Path(__file__).parent / "cookies"
        self.cookies_dir.mkdir(exist_ok=True)

    async def init_browser(self):
        """初始化浏览器"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=self.headless,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        )

    async def load_cookies(self, platform: str) -> bool:
        """加载指定平台的 Cookies"""
        cookie_file = self.cookies_dir / f"{platform}.json"
        if not cookie_file.exists():
            print(f"❌ {platform} Cookies 不存在，请先登录")
            return False

        with open(cookie_file, 'r', encoding='utf-8') as f:
            cookies = json.load(f)

        # 添加到浏览器上下文
        await self.context.add_cookies(cookies)
        print(f"✅ {platform} Cookies 加载成功")
        return True

    async def save_cookies(self, platform: str):
        """保存指定平台的 Cookies"""
        cookies = await self.context.cookies()
        cookie_file = self.cookies_dir / f"{platform}.json"

        with open(cookie_file, 'w', encoding='utf-8') as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)

        print(f"✅ {platform} Cookies 已保存")

    async def login(self, platform: str):
        """登录指定平台并保存 Cookies"""
        print(f"\n🔐 开始登录 {platform}...")

        # 创建新的浏览器上下文
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await self.context.new_page()

        # 各平台登录 URL
        urls = {
            'weibo': 'https://weibo.com/login.php',
            'zhihu': 'https://www.zhihu.com/signin',
            'juejin': 'https://juejin.cn/login',
            'bilibili': 'https://passport.bilibili.com/login',
            'v2ex': 'https://www.v2ex.com/signin',
            'oschina': 'https://www.oschina.net/home/login'
        }

        if platform not in urls:
            print(f"❌ 不支持的平台：{platform}")
            return

        # 打开登录页面
        await page.goto(urls[platform], wait_until='networkidle')
        print(f"📱 请在浏览器中登录 {platform}")
        print("   登录完成后按回车键保存 Cookies...")
        input()

        # 等待页面稳定
        await page.wait_for_timeout(3000)

        # 保存 Cookies
        await self.save_cookies(platform)
        print(f"✅ {platform} 登录完成！")

        await page.close()

    async def post_weibo(self, content: str, images: list = None):
        """发布微博"""
        print("\n📱 发布微博...")

        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        if not await self.load_cookies('weibo'):
            print("❌ 微博未登录，请先运行 --login weibo")
            return False

        page = await self.context.new_page()

        try:
            # 打开微博首页
            await page.goto('https://weibo.com', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 找到发布框
            publish_box = await page.query_selector('textarea[placeholder="有什么新鲜事..."]')
            if not publish_box:
                # 尝试其他选择器
                publish_box = await page.query_selector('textarea[placeholder="分享你的日常..."]')

            if not publish_box:
                print("❌ 未找到发布框")
                return False

            # 输入内容
            await publish_box.fill(content)
            print("✅ 内容已输入")

            # 上传图片 (如果有)
            if images:
                upload_button = await page.query_selector('input[type="file"]')
                if upload_button:
                    for image in images[:9]:  # 微博最多 9 张图
                        await upload_button.set_input_files(image)
                        await page.wait_for_timeout(1000)
                    print(f"✅ 已上传 {len(images)} 张图片")

            # 点击发布按钮
            publish_button = await page.query_selector('a[action-type="publish"]')
            if publish_button:
                await publish_button.click()
                await page.wait_for_timeout(3000)
                print("✅ 微博发布成功！")
                return True
            else:
                print("⚠️ 未找到发布按钮，可能需要手动点击")
                return False

        except Exception as e:
            print(f"❌ 发布失败：{e}")
            return False
        finally:
            await page.close()

    async def post_zhihu(self, title: str, content: str):
        """发布知乎动态/文章"""
        print("\n📖 发布知乎...")

        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        if not await self.load_cookies('zhihu'):
            print("❌ 知乎未登录，请先运行 --login zhihu")
            return False

        page = await self.context.new_page()

        try:
            # 打开知乎首页
            await page.goto('https://www.zhihu.com', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 点击"写文章"或"发布"
            # 知乎的按钮选择器经常变化，这里使用多种方式
            publish_button = await page.query_selector('button:has-text("写文章")')
            if not publish_button:
                publish_button = await page.query_selector('button:has-text("发布")')
            if not publish_button:
                # 尝试其他方式
                await page.goto('https://zhuanlan.zhihu.com/write', wait_until='networkidle')

            # 输入标题
            title_input = await page.query_selector('input[placeholder="输入文章标题"]')
            if title_input:
                await title_input.fill(title)
                print("✅ 标题已输入")

            # 输入内容 (使用富文本编辑器)
            editor = await page.query_selector('.ProseMirror')
            if editor:
                await editor.fill(content)
                print("✅ 内容已输入")

            # 点击发布
            submit_button = await page.query_selector('button:has-text("发布")')
            if submit_button:
                await submit_button.click()
                await page.wait_for_timeout(3000)
                print("✅ 知乎发布成功！")
                return True
            else:
                print("⚠️ 未找到发布按钮，可能需要手动点击")
                return False

        except Exception as e:
            print(f"❌ 发布失败：{e}")
            return False
        finally:
            await page.close()

    async def post_juejin(self, title: str, content: str):
        """发布掘金动态"""
        print("\n🥕 发布掘金...")

        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        if not await self.load_cookies('juejin'):
            print("❌ 掘金未登录，请先运行 --login juejin")
            return False

        page = await self.context.new_page()

        try:
            # 打开掘金
            await page.goto('https://juejin.cn', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 点击发布按钮
            publish_button = await page.query_selector('button:has-text("发布")')
            if not publish_button:
                # 直接跳转到发布页面
                await page.goto('https://juejin.cn/dynamic', wait_until='networkidle')

            # 找到输入框
            input_box = await page.query_selector('div[contenteditable="true"]')
            if input_box:
                await input_box.fill(content)
                print("✅ 内容已输入")

            # 点击发布
            submit_button = await page.query_selector('button:has-text("发布动态")')
            if submit_button:
                await submit_button.click()
                await page.wait_for_timeout(3000)
                print("✅ 掘金发布成功！")
                return True
            else:
                print("⚠️ 未找到发布按钮，可能需要手动点击")
                return False

        except Exception as e:
            print(f"❌ 发布失败：{e}")
            return False
        finally:
            await page.close()

    async def post_bilibili(self, content: str):
        """发布 B 站动态"""
        print("\n📺 发布 B 站动态...")

        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        if not await self.load_cookies('bilibili'):
            print("❌ B 站未登录，请先运行 --login bilibili")
            return False

        page = await self.context.new_page()

        try:
            # 打开 B 站
            await page.goto('https://t.bilibili.com', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 找到输入框
            input_box = await page.query_selector('textarea[placeholder="分享你的动态..."]')
            if input_box:
                await input_box.fill(content)
                print("✅ 内容已输入")

            # 点击发布
            submit_button = await page.query_selector('button:has-text("发布")')
            if submit_button:
                await submit_button.click()
                await page.wait_for_timeout(3000)
                print("✅ B 站动态发布成功！")
                return True
            else:
                print("⚠️ 未找到发布按钮，可能需要手动点击")
                return False

        except Exception as e:
            print(f"❌ 发布失败：{e}")
            return False
        finally:
            await page.close()

    async def post_v2ex(self, title: str, content: str):
        """发布 V2EX"""
        print("\n💬 发布 V2EX...")

        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        if not await self.load_cookies('v2ex'):
            print("❌ V2EX 未登录，请先运行 --login v2ex")
            return False

        page = await self.context.new_page()

        try:
            # 打开 V2EX 发帖页面
            await page.goto('https://www.v2ex.com/new', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # 输入标题
            title_input = await page.query_selector('input[name="title"]')
            if title_input:
                await title_input.fill(title)
                print("✅ 标题已输入")

            # 输入内容
            content_input = await page.query_selector('textarea[name="content"]')
            if content_input:
                await content_input.fill(content)
                print("✅ 内容已输入")

            # 点击提交
            submit_button = await page.query_selector('input[type="submit"]')
            if submit_button:
                await submit_button.click()
                await page.wait_for_timeout(3000)
                print("✅ V2EX 发布成功！")
                return True
            else:
                print("⚠️ 未找到提交按钮")
                return False

        except Exception as e:
            print(f"❌ 发布失败：{e}")
            return False
        finally:
            await page.close()

    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='国内社媒自动化发布脚本')
    parser.add_argument('--login', type=str, help='登录指定平台：weibo|zhihu|juejin|bilibili|v2ex|oschina')
    parser.add_argument('--release', type=str, help='发布 Release 内容')
    parser.add_argument('--url', type=str, help='GitHub Release URL')
    parser.add_argument('--platform', type=str, default='all', help='发布平台：all|weibo|zhihu|juejin|bilibili|v2ex')
    parser.add_argument('--headless', action='store_true', help='无头模式')

    args = parser.parse_args()

    bot = SocialMediaBot(headless=args.headless)

    try:
        await bot.init_browser()

        if args.login:
            # 登录模式
            await bot.login(args.login)

        elif args.release:
            # 发布模式
            content = f"""🎉 OpenClaw Doc Viewer {args.release} 发布！

作为 OpenClaw 的忠实用户，用半年后发现文档查看不方便，
就自己做了个文档查看器：

✨ 专为 OpenClaw 生成的 Markdown 设计
🔍 全文搜索 <100ms (1000+ 文档)
🌍 支持 4 种语言 (EN/CN/JP/ES)
🌙 暗黑模式 + 响应式
🆓 MIT 开源

GitHub: {args.url}

欢迎 OpenClaw 的小伙伴们试用提 issue！

#OpenClaw #开源 #Vue3 #NodeJS #文档管理
"""

            platforms = []
            if args.platform == 'all':
                platforms = ['weibo', 'zhihu', 'juejin', 'bilibili', 'v2ex']
            else:
                platforms = [args.platform]

            for platform in platforms:
                if platform == 'weibo':
                    await bot.post_weibo(content)
                elif platform == 'zhihu':
                    await bot.post_zhihu(f"OpenClaw Doc Viewer {args.release} 发布", content)
                elif platform == 'juejin':
                    await bot.post_juejin(f"OpenClaw Doc Viewer {args.release}", content)
                elif platform == 'bilibili':
                    await bot.post_bilibili(content)
                elif platform == 'v2ex':
                    await bot.post_v2ex(
                        f"【分享】OpenClaw Doc Viewer {args.release} - 开源文档查看器",
                        content
                    )

                await asyncio.sleep(3)  # 避免频率过高

        else:
            parser.print_help()

    finally:
        await bot.close()


if __name__ == '__main__':
    asyncio.run(main())
