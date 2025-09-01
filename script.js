document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');

    // 游戏配置
    const gridSize = 20; // 网格大小
    const tileCount = canvas.width / gridSize; // 网格数量
    let speed = 6; // 游戏速度（降低20%后约为5.6，取整为6）

    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;
    let animationId = null;

    // 蛇的初始位置和速度
    let snake = [
        { x: 5, y: 5 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    let nextVelocityX = 0;
    let nextVelocityY = 0;

    // 食物位置
    let food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // 游戏主循环
    function gameLoop() {
        if (gameOver) {
            drawGameOver();
            return;
        }

        if (gamePaused) {
            drawPaused();
            return;
        }

        if (!gameRunning) return;

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新蛇的位置
        updateSnake();

        // 检查碰撞
        checkCollision();

        // 绘制食物和蛇
        drawFood();
        drawSnake();

        // 绘制网格
        drawGrid();

        // 继续游戏循环
        animationId = setTimeout(() => {
            requestAnimationFrame(gameLoop);
        }, 1000 / speed);
    }

    // 更新蛇的位置
    function updateSnake() {
        // 更新速度方向
        velocityX = nextVelocityX;
        velocityY = nextVelocityY;

        // 移动蛇
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;

            // 增加速度
            if (score % 50 === 0 && speed < 12) {
                speed += 1;
            }

            // 生成新的食物
            generateFood();
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
    }

    // 检查碰撞
    function checkCollision() {
        const head = snake[0];

        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            return;
        }

        // 检查是否撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
    }

    // 生成新的食物
    function generateFood() {
        // 生成随机位置
        let newFood;
        let foodOnSnake;

        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };

            // 检查食物是否在蛇身上
            for (let i = 0; i < snake.length; i++) {
                if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);

        food = newFood;
    }

    // 绘制网格
    function drawGrid() {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;

        // 绘制垂直线
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
        }

        // 绘制水平线
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }

    // 绘制蛇
    function drawSnake() {
        // 绘制蛇身
        for (let i = 1; i < snake.length; i++) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
        }

        // 绘制蛇头
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);

        // 绘制蛇眼睛
        ctx.fillStyle = 'white';
        const eyeSize = gridSize / 5;
        const eyeOffset = gridSize / 3;

        // 根据移动方向绘制眼睛
        if (velocityX === 1) { // 向右
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset, snake[0].y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset, snake[0].y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (velocityX === -1) { // 向左
            ctx.fillRect(snake[0].x * gridSize + eyeOffset - eyeSize, snake[0].y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(snake[0].x * gridSize + eyeOffset - eyeSize, snake[0].y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (velocityY === -1) { // 向上
            ctx.fillRect(snake[0].x * gridSize + eyeOffset, snake[0].y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset - eyeSize, snake[0].y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (velocityY === 1) { // 向下
            ctx.fillRect(snake[0].x * gridSize + eyeOffset, snake[0].y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset - eyeSize, snake[0].y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
        } else { // 默认向右
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset, snake[0].y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(snake[0].x * gridSize + gridSize - eyeOffset, snake[0].y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
    }

    // 绘制食物
    function drawFood() {
        // 绘制食物主体
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 绘制食物顶部的小叶子
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(centerX, food.y * gridSize + 3, radius / 3, radius / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制游戏暂停状态
    function drawPaused() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏已暂停', canvas.width / 2, canvas.height / 2);
    }

    // 绘制游戏结束状态
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '18px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('按"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 50);
    }

    // 开始游戏
    function startGame() {
        if (gameOver) {
            resetGame();
        }

        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            // 初始方向向右
            nextVelocityX = 1;
            nextVelocityY = 0;
            gameLoop();
        }
    }

    // 暂停游戏
    function togglePause() {
        if (!gameRunning || gameOver) return;

        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? '继续' : '暂停';
        
        if (!gamePaused) {
            requestAnimationFrame(gameLoop);
        }
    }

    // 重置游戏
    function resetGame() {
        // 清除之前的游戏循环
        if (animationId) {
            clearTimeout(animationId);
        }

        // 重置游戏状态
        gameRunning = false;
        gamePaused = false;
        gameOver = false;
        score = 0;
        speed = 6;
        scoreElement.textContent = score;
        pauseBtn.textContent = '暂停';

        // 重置蛇
        snake = [{ x: 5, y: 5 }];
        velocityX = 0;
        velocityY = 0;
        nextVelocityX = 0;
        nextVelocityY = 0;

        // 重置食物
        generateFood();

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawSnake();
        drawFood();
    }

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        // 如果游戏未开始或已结束，忽略按键
        if (!gameRunning || gameOver) return;

        // 根据按键设置下一个方向
        switch (e.key) {
            case 'ArrowUp':
                // 防止直接反向移动
                if (velocityY !== 1) {
                    nextVelocityX = 0;
                    nextVelocityY = -1;
                }
                break;
            case 'ArrowDown':
                if (velocityY !== -1) {
                    nextVelocityX = 0;
                    nextVelocityY = 1;
                }
                break;
            case 'ArrowLeft':
                if (velocityX !== 1) {
                    nextVelocityX = -1;
                    nextVelocityY = 0;
                }
                break;
            case 'ArrowRight':
                if (velocityX !== -1) {
                    nextVelocityX = 1;
                    nextVelocityY = 0;
                }
                break;
            case ' ': // 空格键暂停/继续
                togglePause();
                break;
        }
    });

    // 按钮事件监听
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);

    // 初始化游戏
    resetGame();
});