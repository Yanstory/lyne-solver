LYNE puzzle solver
==================
LYNE 谜题解决机 汉化版

给原作者打赏：[![Donate using PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=denilsonsa%40gmail%2ecom&lc=US&item_name=Denilson&item_number=lyne-solver&currency_code=BRL)

在Flattr上马一个：[![Flattr this project](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=denilsonsa&url=https%3A%2F%2Fgithub.com%2Fdenilsonsa%2Flyne-solver&title=LYNE+solver&description=Solver+for+LYNE+game.&tags=github&category=software)

这是一个供 [LYNE][] 游戏使用的答案生成器，同时支持逐步显示连接路径来为玩家提供提示（而非整个谜题的答案）。

这个生成器使用 JavaScript 以及 HTML、CSS和SVG编写，应该能在桌面端和移动端的任意高级浏览器上正常运行。

生成器在 Google Chrome 43 和 Mozilla Firefox 38 上测试成功。

[点此通过浏览器在线使用！][solver]

如何使用？
----------------------

在输入框中以文字形式键入谜题布局， 点击 `Solve it!` 按钮查找一个解。拖动滑条可以逐渐显示路径，直至路径全部显示（谜题答案出现）。

谜题布局的输入方式以下方字母定义：

* 小写字母 `t`, `s`, `d`, `p`, `h` 代表经过点的图形

（其中t=三角形，s=正方形，d=菱形，p=五边形，h=六边形）
* 大写字母 `T`, `S`, `D`, `P`, `H` 代表起止点图形（中间会有一个白色填充）
* 数字 `1`, `2`, `3`, `4` 代表可以多次经过的图形（数字代表可以经过的次数）
* `空格` 代表一个没有图形的分隔点
* 同时 `0` (零) 也可以代表分隔点

请注意在原版 LYNE 游戏中最多出现 3 种图形，且不会同时出现全部 4 种可多次经过的图形。

离线使用
-------------

你可以将这个解决机下载后在本地离线使用。

但在本地使用 Google Chrome 打开会因为 "same origin" 安全限制而无法使用。详情参考 [这里][sameorigin], 或参考 [谷歌官方反馈 issue 47416][sameoriginissue]. Firefox 则似乎能正常运行。

关于游戏 LYNE
----------

[LYNE][] 是由 [Thomas Bowker][tb] 使用 [Unity][] 编写的一款游戏。你可以在 [Google Play][play]、 [亚马逊应用商店][amazon], [iTunes][itunes], [Windows Phone 商店][wp], [Steam][steam], [Humble Bundle 商店][humble], [itch.io][itch] 上找到它。同时，这个游戏还提供 [DRM-free][lyne] 版本

About this solver (under-the-hood information)
----------------------------------------------

This solver was written by [Denilson Sá][denilsonsa] using modern web technologies. The list below contains some highlights of the underlying code:

* The gray diamond shape in the background was written using pure CSS, with a combination of [`linear-gradient()`][linear-gradient] and [`background-size`][background-size], inspired by [CSS3 Patterns Gallery][css3patterns].
* The layout is done using [`flex`][flex] and [viewport-relative units][viewport-units], which means it is responsive and should adapt to any screen size. Some scrolling might be required if the display is not wide enough, and this was a deliberate choice.
* The slider is HTML5 `<input type="range">`.
* [Pure JavaScript code][vanillajs] without using any additional library.
* Event-handling through `oninput` event, which fires as soon as the text or the slider changes their value. This gives a faster feedback than `onchange` and is much better than using `onkeydown`/`onkeyup`/`onkeypress` events, because it will work even if the value is changed by the mouse, and it won't run the even handler if the user just presses keys without changing the content (e.g. arrow keys).
* Graphics built using SVG. Each shape is defined once using `<defs>` and `<symbol>`, and later used as many times as needed with `<use>`.
* Dynamically-generated SVG content. For some reason, browsers do not allow modifying `viewBox` attribute in `<svg>` element, nor modifying any of the relevant attributes of `<use>` element. For this reason, the entire SVG source-code is rewritten into a string and then added to the document (using `innerHTML`).
* The solver is implemented as a simple recursive [backtracking][] algorithm.
* The algorithm runs in a background thread using [Web Workers][workers].
* Many LYNE puzzles have multiple solutions. The solver finds one arbitrary solution. It is possible to adapt the code to find all solutions, but it would also require additional code to remove duplicate solutions.
* There is function to output a plain text representation of the solution, but there is no UI for it. It was implemented as a way to check if the algorithm worked, before the SVG-building function was written.

[solver]: http://denilsonsa.github.io/lyne-solver/lyne-solver.html
[lyne]: http://www.lynegame.com/
[play]: https://play.google.com/store/apps/details?id=com.thomasbowker.lynerelease
[amazon]: http://www.amazon.com/Thomas-Bowker-LYNE/dp/B00HA8WNZ0
[itunes]: https://itunes.apple.com/us/app/lyne/id731753333
[wp]: http://www.windowsphone.com/en-us/store/app/lyne/bf04e86a-cf61-491e-b095-a257fb725f5e
[steam]: http://store.steampowered.com/app/266010/
[humble]: https://www.humblebundle.com/store/p/lyne_storefront
[itch]: http://thomasbowker.itch.io/lyne
[tb]: http://thomasbowker.com/
[unity]: https://unity3d.com/
[denilsonsa]: http://denilson.sa.nom.br/
[linear-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
[background-size]: https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
[css3patterns]: http://lea.verou.me/css3patterns/
[flex]: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
[viewport-units]: http://www.w3.org/TR/css3-values/#viewport-relative-lengths
[vanillajs]: http://vanilla-js.com/
[backtracking]: https://en.wikipedia.org/wiki/Backtracking
[sameorigin]: http://www.html5rocks.com/en/tutorials/workers/basics/#toc-security-local
[sameoriginissue]: https://code.google.com/p/chromium/issues/detail?id=47416
[workers]: http://www.w3.org/TR/workers/
