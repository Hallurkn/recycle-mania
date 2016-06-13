/**
 * Created by Hallur on 29-05-2016.
 */
var stage, infoCanvas;
var assets = {
    hero: {},
    boss: {},
    grandma: {},
    car: {},
    background: {},
    windmill1: {},
    windmill2: {},
    windmill3: {},
    cloud1: {},
    cloud2: {},
    cloud3: {},
    sun: {},
    splash: {},
    firstSplash: {}
}
var cleanX, cleanY;
var carBody, carTire1, carTire2;
var sound;
var texts = {
    preloadText : {},
    stupidText : {}
}
var queue;
var extraTime = 21;
var timerText = [];
var bin = [];
var garbage = [];
var amount = 3;
var money = 0;
var moneyText;
var booleans = {
    pickup: false,
    heroHit: false,
    clicked: false,
    gameRunning: false,
    stageMoved: false,
    defyPhysics: false
}
var roundsComplete = -1;
var itemsGone = 0;
var correct = 0;
var lives = 3;
var level = 1;
var random;
var startTime, currentTime;
var powerup = {
    speed : {},
    grandma : {}
}
var carSpeed = 10;
//var speedPowerUp = false; For future use

var keys = {
    shiftkd:false,
    spacekd:false,
    rkd:false,
    lkd:false,
    ukd:false,
    dkd:false
};

function preload(){
    stage = new createjs.Stage("canvas");
    infoCanvas = new createjs.Stage("second")
    preloadText = new createjs.Text("0%", "70px monospace", "#FFF");
    preloadText.textBaseline = "middle";
    preloadText.textAlign = "center";
    preloadText.x = stage.canvas.width/2;
    preloadText.y = stage.canvas.height/2;
    stage.addChild(preloadText);

    stupidText = new createjs.Text("Initializing game", "40px monospace", "#FFF");
    stupidText.textBaseline = "middle";
    stupidText.textAlign = "center";
    stupidText.x = stage.canvas.width/2;
    stupidText.y = stage.canvas.height/2 + 80;
    stage.addChild(stupidText);

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', loading);
    queue.on('complete', splashScreen);

    queue.loadManifest([
        {id:"background", src:"img/background.png"},
        {id:"paperBin", src:"img/green_bin.png"},
        {id:"glassBin", src:"img/blue_bin.png"},
        {id:"compostBin", src:"img/red_bin.png"},
        {id:"electronicsBin", src:"img/yellow_bin.png"},
        {id:"windmill", src:"img/mill_rotate.png"},
        {id:"cloud", src:"img/cloud.png"},
        {id:"glass", src:"img/glass.png"},
        {id:"paper", src:"img/paper.png"},
        {id:"carBody", src:"img/carBody.png"},
        {id:"carTire", src:"img/carTire.png"},
        {id:"compost", src:"img/compost.png"},
        {id:"electronics", src:"img/electronics.png"},
        {id:"unmuted", src:"img/unmuted.png"},
        {id:"muted", src:"img/muted.png"},
        {id:"firstSplash", src:"img/splash_one.png"},
        {id:"splash", src:"img/splash.png"},
        {id:"nextLevel", src:"img/nextLevel.png"},
        {id:"heroSS", src:"js/sprite.json"},
        {id:"grandmaSS", src:"js/spriteGrandma.json"},
        {id:"fallingSound", src:"sound/falling.wav"},
        {id:"winSound", src:"sound/win.wav"},
        {id:"loseSound", src:"sound/lose.wav"},
        {id:"wrongSound", src:"sound/wrong.wav"},
        {id:"paperSound", src:"sound/garbage.wav"},
        {id:"parkSound", src:"sound/park.wav"},
        {id:"windmillSound", src:"sound/windmill.wav"}
    ])
}
function loading (e){
    //console.log(e.progress);
    var preloadCalc = Math.round(e.progress*100);
    preloadText.text = preloadCalc + "%";
    if (preloadCalc > 94){
        document.querySelector('#canvas').classList.add('changeColor');
    }

    if (preloadCalc > 90 && preloadCalc < 100) {
        stupidText.text = "Clapping my hands...";
    } else if (preloadCalc < 10 && preloadCalc > 1){
        stupidText.text = "Painting skies...";
    }
    stage.update();
}
//Should rewrite this, DRY
function switchSound(){
    if (booleans.clicked) {
        sound.removeEventListener('click', switchSound);
        infoCanvas.removeChild(sound);
    }
    unmuteSounds();
    booleans.clicked = true;
    sound = new createjs.Bitmap(queue.getResult("unmuted"));
    sound.x = infoCanvas.canvas.width/2;
    sound.y = 20;
    infoCanvas.addChild(sound);
    sound.addEventListener('click', otherSound);
    infoCanvas.update();
}
function muteSounds(){
    createjs.Sound.setMute("parkSound");
    createjs.Sound.setMute("fallingSound");
    createjs.Sound.setMute("paperSound");
    createjs.Sound.setMute("wrongSound");
    createjs.Sound.setMute("winSound");
    createjs.Sound.setMute("loseSound");
}
function unmuteSounds(){
    //FILL IN SOUND ON
}
function otherSound() {
    sound.removeEventListener('click', otherSound);
    infoCanvas.removeChild(sound);
    muteSounds();
    sound = new createjs.Bitmap(queue.getResult("muted"));
    sound.x = infoCanvas.canvas.width/2;
    sound.y = 20;
    infoCanvas.addChild(sound);
    sound.addEventListener('click', switchSound);
    infoCanvas.update();
}
function splashScreen(){
    stage.y = 1050;
    switchSound(); //Mutes all sounds
    stage.removeChild(preloadText);
    window.addEventListener('keydown', fingerDown);
    window.addEventListener('keyup', fingerUp);
    createjs.Sound.play("parkSound", {loop:-1});

    assets.background = new createjs.Bitmap(queue.getResult("background"));
    assets.background.y = -1050;

    assets.sun = new createjs.Shape();
    assets.sun.graphics.beginFill("#FCEF00").drawCircle(0,0,40);
    assets.sun.x = 670;
    assets.sun.y = 60;

    assets.windmill1=createWindmill(107, 145);
    assets.windmill2=createWindmill(201, 128);
    assets.windmill3=createWindmill(297, 138);
    assets.cloud1=createCloud(200, 10);
    assets.cloud2=createCloud(500, 20);
    assets.cloud3=createCloud(20, 20);

    /*assets.splash = new createjs.Bitmap(queue.getResult('splash'));
    assets.splash.alpha = 1;
    assets.splash.addEventListener('click', startLevel);

    assets.firstSplash = new createjs.Bitmap(queue.getResult('firstSplash'));
    assets.firstSplash.alpha=1;
    assets.firstSplash.addEventListener('click', function(){
        assets.firstSplash.removeEventListener('click');
        stage.removeChild(assets.firstSplash);
        stage.addChild(assets.splash);
        stage.update();
    });*/

    assets.car = new createjs.Container();
    assets.car.width = 269;
    assets.car.height = 55;
    assets.car.regY = 30;
    assets.car.x = -200;
    assets.car.y = 300 + Math.floor(Math.random()*100);
    assets.car.driving = false;
    assets.car.dangerous = true;

    carBody = new createjs.Bitmap(queue.getResult("carBody"));

    carTire1=createTire(66, 78);
    carTire2=createTire(225,78);
    function createTire(x, y){
        t = new createjs.Bitmap(queue.getResult("carTire"));
        t.width = 34;
        t.height = 34;
        t.regX = t.width/2;
        t.regY = t.height/2;
        t.x = x;
        t.y = y;
        return t;
    }

    assets.car.addChild(carBody, carTire1, carTire2);

    assets.boss = new createjs.Shape();
    assets.boss.graphics.beginFill("#F00").drawRect(0,0,120,30);
    assets.boss.x = stage.canvas.width/2;
    assets.boss.y = -400;
    assets.boss.width = 120;
    assets.boss.height = 30;
    
    var heroSpriteSheet = new createjs.SpriteSheet(queue.getResult("heroSS"));
    assets.hero = new createjs.Sprite(heroSpriteSheet, 'standRight');
    assets.hero.width = 64;
    assets.hero.height = 64;
    assets.hero.regX = assets.hero.width/2;
    assets.hero.regY = assets.hero.height/2;
    assets.hero.x = 20;
    assets.hero.y = 400;
    assets.hero.speed = 5;
    assets.hero.garbage=null;
    assets.hero.pickup=false;
    assets.hero.rotation=0;

    var grandmaSpriteSheet = new createjs.SpriteSheet(queue.getResult("grandmaSS"));
    assets.grandma = new createjs.Sprite(grandmaSpriteSheet, 'clean');
    assets.grandma.width = 82;
    assets.grandma.height = 88;
    assets.grandma.regX = assets.grandma.width/2;
    assets.grandma.regY = assets.grandma.height/2;
    assets.grandma.x = stage.canvas.width + assets.grandma.width;
    assets.grandma.y = 350;
    assets.grandma.active=false;
    assets.grandma.init=false;
    assets.grandma.rotation=-20;


    //Adding the assets, placement important
    stage.addChild(assets.background, assets.sun, assets.cloud1, assets.cloud2, assets.cloud3,
        assets.windmill1, assets.windmill2, assets.windmill3);

    stage.update();
    startLevel();
}
function moveCloud (cloud, xValue, time){
    createjs.Tween.get(cloud)
        .to({x:xValue}, time, createjs.Ease.circIn)
}
function animateStage (){
    createjs.Tween.get(stage).wait(300)
        .to({y:700}, 5000, createjs.Ease.cubicInOut).wait(1000)
        .to({y:0}, 3000, createjs.Ease.cubicInOut).call(function(){
        booleans.stageMoved=true;
        animateText(livesText, 1);
        animateText(levelText, 1);
    });
}

function animateText(type, value){
    createjs.Tween.get(type)
        .to({alpha:value}, 500, createjs.Ease.cubicIn)
}

function startLevel (){
    booleans.gameRunning=true;
    swal({
        title: "Get ready",
        text: "Garbage will fall from the sky..",
        showConfirmButton: true
},function(){
        animateStage(0, 4000);
        animateBoss();
     });

    /*if (level == 1){
    createjs.Tween.get(assets.splash)
        .to({alpha:0}, 0, createjs.Ease.circOut).call(function() {
        assets.splash.removeEventListener('click', startLevel);
        })
    }*/

        //instructions for each level needed

    if (level > 1) {
        //levelNext.removeEventListener('click', startLevel);
        stage.removeChild(gratsText);
        assets.hero.x = 20;
        assets.hero.y = 400;
        assets.cloud1.x = 200;
        assets.cloud1.y = 10;
        assets.cloud2.x = 500;
        assets.cloud2.y = 20;
        assets.cloud3.x = 20;
        assets.cloud3.y = 20;
        assets.windmill1.rotation = 0;
        assets.windmill2.rotation = 0;
        assets.windmill3.rotation = 0;
    }

    bin.push(createBin('paperBin', 'paper', 53, 68, 700, 500));
    bin.push(createBin('glassBin', 'glass', 53, 68, 700, 280));
    completeText = new createjs.Text("Sorted Right: 0%", "20px monospace", "#000");
    completeText.y = 90;
    infoCanvas.addChild();
    livesText = new createjs.Text("Lives: " + lives, "30px monospace", "#fff");
    levelText = new createjs.Text("Level: " + level, "30px monospace", "#fff");
    stage.addChild(levelText, livesText);
    levelText.y = 60;
    livesText.y = 30;
    if (level < 2) {
        levelText.alpha = 0;
        livesText.alpha = 0;
    }
    moneyText = new createjs.Text(money + "$", "30px monospace");
    if (money<0){
        moneyText.color = "#F00"
    } else {
        moneyText.color = "#0F0"
    }
    moneyText.y = 50;
    infoCanvas.addChild(moneyText, completeText);
    infoCanvas.update();

    wrongBin = new createjs.Text("!WRONG BIN!", "25px monospace", "#f00");


    if (level > 1) {
        bin.push(createBin('compostBin', 'compost', 53, 68, 430, 280));
    }

    if (level > 2) {
        bin.push(createBin('electronicsBin', 'electronics', 53, 68, 430, 500));
    }

    stage.addChild(assets.hero, assets.boss);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', onTick);
    stage.update();
}
function createCloud(x, y){
    var c = new createjs.Bitmap(queue.getResult('cloud'));
    c.x = x;
    c.y = y;
    return c;
}
function animateBoss(){
    createjs.Tween.get(assets.boss)
        .to({x: stage.canvas.width/2, y:-500}, 1500, createjs.circInOut)
        .to({x: 0, y:-400}, 1500, createjs.circInOut)
        .to({x: stage.canvas.width - assets.boss.width}, 3000, createjs.circInOut).call(function(){
        animateBoss();
    })
}
function bossLevel(){

}
function animateGrandma(){
    stage.addChild(assets.grandma);
    assets.grandma.init=true;

    createjs.Tween.get(assets.grandma)
        .to({x: stage.canvas.width/2-assets.grandma.width/2}, 2000, createjs.circOut).call(function(){
        assets.grandma.active=true;
    }).wait(500)
        .to({x: -assets.grandma.width}, 2000, createjs.circOut).call(function(){
        console.log(assets.grandma.x);
        assets.grandma.x = stage.canvas.width + assets.grandma.width;
        assets.grandma.active=false;
        assets.grandma.init=false;
        stage.removeChild(assets.grandma);
    });
}


function createWindmill(x, y){
    var w = new createjs.Bitmap(queue.getResult("windmill"));
    w.width = 71;
    w.height = 63;
    w.regX = w.width/2;
    w.regY = 41;
    w.x = x;
    w.y = y;
    return w;
}
function createBin(img, type, width, height, x, y){
    var bin = new createjs.Bitmap(queue.getResult(img));
    bin.width = width;
    bin.height = height;
    bin.regX = bin.width/2;
    bin.regY = bin.height/2;
    bin.x = x;
    bin.y = y;
    bin.type = type;
    bin.touching = false;
    stage.addChild(bin);
    return bin;
}
function createGarbage(type, width, height){
    var g = new createjs.Bitmap(queue.getResult(type));
    g.height = height;
    g.width = width;
    g.regX = g.width/2;
    g.regY = g.height/2;
    g.x = 300+Math.floor(Math.random()*20);
    g.y = 350+Math.floor(Math.random()*20);
    g.type = type;
    g.touching = false;
    return g;
}
function addGarbage() {
    for (var i = 0; i < amount; i++) {
        //initialize the time for every item
        startTime = (new Date()).getTime();

        //make a createGarbage function

        glass=createGarbage('glass', 17, 52);
        paper=createGarbage('paper', 49, 49);
        compost=createGarbage('compost', 49, 49);
        electronics=createGarbage('electronics', 49, 49);

        levelChecker();

        switch (random) {
            case 0:
                stage.addChild(glass);
                garbage.push(glass);
                animateGarbage(garbage[i], i);
                garbage[i].dangerous = true;
                break;
            case 1:
                stage.addChild(paper);
                garbage.push(paper);
                animateGarbage(garbage[i], i);
                garbage[i].dangerous = true;
                break;
            case 2:
                stage.addChild(compost);
                garbage.push(compost);
                animateGarbage(garbage[i], i);
                garbage[i].dangerous = true;
                break;
            case 3:
                stage.addChild(electronics);
                garbage.push(electronics);
                animateGarbage(garbage[i], i);
                garbage[i].dangerous = true;
                break;
        }
    }
    amount+=level;
    function animateGarbage(garbage, index){
        booleans.pickup=true;
        garbage.y = assets.boss.y;
        garbage.x = assets.boss.x;
        createjs.Tween.get(garbage).wait(300*index)
            .wait(300).to({y: Math.floor(Math.random() * 255 + 275),
            x: Math.floor(Math.random() * 600),
            rotation: Math.floor(Math.random() * 2000)}, 2000, createjs.circOut).call(function(){
            booleans.pickup=false;
            //createjs.Sound.play("fallingSound");
            garbage.dangerous = false;
        });
    }
    function levelChecker(){
        random = Math.floor(Math.random()*2);

        if (level > 1 ) {
            random = Math.floor(Math.random() * 3);
        }
        if (level > 2 ) {
            random = Math.floor(Math.random() * 4);
        }
    }
}
function fingerUp(e){
    if(e.keyCode===16){
        keys.shiftkd=false;
    }
    if(e.keyCode===32){
        keys.spacekd=false;
    }
    if(e.keyCode===37){
        keys.lkd=false;
        assets.hero.gotoAndStop("left");
    }
    if(e.keyCode===38){
        keys.ukd=false;
        assets.hero.gotoAndStop("up");
    }
    if(e.keyCode===39){
        keys.rkd=false;
        assets.hero.gotoAndStop("standRight");
    }
    if(e.keyCode===40){
        keys.dkd=false;
        assets.hero.gotoAndStop("down");
    }
}
function fingerDown(e){
    if(e.keyCode===16){
        keys.shiftkd=true;
    }
    if(e.keyCode===32){
        keys.spacekd=true;
    }
    if(e.keyCode===37){
        keys.lkd=true;
        if (assets.hero.currentAnimation != "left") {
            assets.hero.gotoAndPlay("left");
        }
    }
    if(e.keyCode===38){
        keys.ukd=true;
        if (assets.hero.currentAnimation != "up") {
            assets.hero.gotoAndPlay("up");
        }
    }
    if(e.keyCode===39){
        keys.rkd=true;
        if (assets.hero.currentAnimation != "right") {
            assets.hero.gotoAndPlay("right");
        }
    }
    if(e.keyCode===40){
        keys.dkd=true;
        if (assets.hero.currentAnimation != "down") {
            assets.hero.gotoAndPlay("down");
        }
    }
}
function moveHero(){
    if(keys.shiftkd) {
        assets.hero.speed=9;
    } else {
        assets.hero.speed=5;
    }
    if(keys.rkd){
        assets.hero.x+=assets.hero.speed;
        if (assets.hero.garbage) {
            assets.hero.garbage.x += assets.hero.speed;
        }
    }
    if(keys.lkd){
        assets.hero.x-=assets.hero.speed;

        if (assets.hero.garbage) {
            assets.hero.garbage.x -= assets.hero.speed;
        }
    }
    if(keys.ukd){
        assets.hero.y-=assets.hero.speed;
        if (assets.hero.garbage) {
            assets.hero.garbage.y -= assets.hero.speed;
        }
    }
    if(keys.dkd){
        assets.hero.y+=assets.hero.speed;
        if (assets.hero.garbage) {
            assets.hero.garbage.y += assets.hero.speed;
        }
    }

    // Not move out of top of Canvas
    if (assets.hero.y < 275) {
        assets.hero.y += assets.hero.speed;
        assets.hero.y = 275;
        if (assets.hero.garbage) {
            assets.hero.garbage.y += assets.hero.speed;
        }
    }
    // Not move out of bottom of Canvas
    if (assets.hero.y+assets.hero.height/2 > stage.canvas.height) {
        assets.hero.y-=assets.hero.speed;
        assets.hero.y = stage.canvas.height - assets.hero.regY;
        if (assets.hero.garbage) {
            assets.hero.garbage.y -= assets.hero.speed;
        }
    }
    // Not move out of left side of Canvas
    if (assets.hero.x < 0 - assets.hero.width/2) {
        assets.hero.x += assets.hero.speed;
        assets.hero.x = stage.canvas.width + assets.hero.regX;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    }
    // Not move out of right side of Canvas
    if (assets.hero.x-assets.hero.width/2 > stage.canvas.width) {
        assets.hero.x-=assets.hero.speed;
        assets.hero.x = -assets.hero.regX;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    }
}
function hitTest(rect1,rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;
}
function checkCollisions() {
        for(var i=0;i<bin.length;i++) {
            if (hitTest(assets.hero, bin[i])) {
                bin[i].touching = true;
            } else {
                bin[i].touching = false;
            }
            if (bin[i].touching && assets.hero.garbage && keys.spacekd && assets.hero.garbage.type == bin[i].type){
                var index = garbage.indexOf(assets.hero.garbage);
                garbage.splice(index,1);
                createjs.Sound.play("paperSound");
                stage.removeChild(assets.hero.garbage);
                assets.hero.garbage=null;
                booleans.pickup=false;
                gainMoney();
            }
            if (bin[i].touching && assets.hero.garbage && keys.spacekd && assets.hero.garbage.type != bin[i].type){
                var index = garbage.indexOf(assets.hero.garbage);
                garbage.splice(index,1);
                createjs.Sound.play("wrongSound"); //needs to be fixed, only works when touching
                stage.removeChild(assets.hero.garbage);
                assets.hero.garbage=null;
                booleans.pickup=false;
                stage.addChild(wrongBin);
                blinkObject(wrongBin);
                loseMoney();
            }
        }
        if (keys.spacekd && !booleans.pickup) {
            for (var i = 0; i < garbage.length; i++) {
                if (hitTest(assets.hero, garbage[i])) {
                    assets.hero.garbage=garbage[i];
                    booleans.pickup=true;
                    garbage[i].timer = 0;
                    if (booleans.pickup) {
                        garbage[i].x = assets.hero.x + 20;
                        garbage[i].y = assets.hero.y - 10;
                    }
                }
            }
        }
        for (var i = 0; i < garbage.length; i++) {
            if (hitTest(assets.hero, garbage[i]) && garbage[i].dangerous) {
                garbage[i].dangerous = false;
                blinkObject(assets.hero);
                lives--;
            }
        }

        if (assets.grandma.active) {
            for (var i = 0; i < garbage.length; i++) {
                createjs.Tween.get(garbage[i])
                    .to({x: assets.grandma.x, y: assets.grandma.y}, 500, createjs.Ease.linear).call(function(){
                });
                if (hitTest(garbage[i], assets.grandma)){
                    stage.removeChild(garbage[i]);
                    garbage.splice(i, 1);
                }
            }
        }

        // IF CAR IS DRIVING

        if (assets.car.driving){
            if (hitTest(assets.hero, assets.car) && assets.car.dangerous){
                console.log("hit");
                booleans.heroHit=true;
                booleans.pickup=false;
                assets.hero.garbage=null;
                createjs.Tween.get(assets.hero)
                    .to({x:Math.floor(Math.random()*stage.canvas.width), y: 500, rotation: 1440}, 1000, createjs.Ease.linear).call(function(){
                    booleans.heroHit = false;
                    assets.hero.rotation = 0;
                })
                assets.car.dangerous=false;
            }
        }
        if (assets.car.x > stage.canvas.width && assets.car.driving){
            assets.car.driving=false;
            assets.car.x = -300;
            assets.car.y = 280 + Math.floor(Math.random()*100);
            stage.removeChild(assets.car);
            assets.car.dangerous=true;
        }
}
function nextLevel (){
    booleans.gameRunning = false;
    stage.removeAllChildren();
    infoCanvas.removeChild(completeText, moneyText);
    garbage = [];
    bin = [];
    //createjs.Sound.play("winSound");

    gratsText = new createjs.Text("Congratulations, you completed level " + level + "!", "30px monospace", "#fff");
    gratsText.textBaseline = "middle";
    gratsText.textAlign = "center";
    gratsText.x = stage.canvas.width/2;
    gratsText.y = stage.canvas.height/2;

    swal({
        title: "Get ready",
        text: "Garbage will fall from the sky..",
        showConfirmButton: true
    },function(){
        booleans.gameRunning=true;
    });

    amount = 3 + level;
    roundsComplete=-1;
    lives = 3;

    stage.addChild(assets.background, assets.sun, assets.cloud1, assets.cloud2, assets.cloud3, assets.windmill1,
        assets.windmill2, assets.windmill3);
    stage.addChild(gratsText);
    level++;

    swal({
        title: "Get funky",
        text: "Garbage will fall from the sky..",
        showConfirmButton: true
    },function(){
        startLevel();
        booleans.gameRunning=true;
    });
    stage.update();
}
function gameOver(){
    //createjs.Sound.play("loseSound");
    //TryAgain code needs to be done
}
function updateText(){
    livesText.text = "Lives: " + lives;
    levelText.text = "Level: " + level;
}
function runTimer(){
    if (garbage.length != 0) {
        for (var i = 0; i < garbage.length ; i++) {
            currentTime = ((new Date()).getTime() * -1);
            garbage[i].timer = Math.floor((currentTime + startTime)/1000) + extraTime;
            //console.log(garbage[i].timer);
            if (garbage[i].timer < 2 && assets.hero.garbage != garbage[i]) {
                blinkObject(garbage[i]);
                /*timerText.push(text);
                stage.addChild(text);
                text.x = garbage[i].x - 20;
                text.y = garbage[i].y - 20;
                text.text = garbage[i].timer;
                stage.addChild(timerText);*/
            }
            if (garbage[i].timer < 0 && assets.hero.garbage != garbage[i]) {
                stage.removeChild(garbage[i]);
                garbage.splice(i, 1);
                loseMoney();
                //stage.removeChild(text);
                //LOSE SCORE
            }
        }
    }
}
function loseMoney() {
    itemsGone++;
    completeText.text = "Sorted Right: " + Math.floor((correct/itemsGone)*100) + "%";
    money-=5;
    moneyText.text = money + "$";
    if (money<0){
        moneyText.color = "#F00"
    } else {
        moneyText.color = "#0F0"
    }
    infoCanvas.update();
}
function gainMoney() {
    itemsGone++;
    correct++;
    completeText.text = "Sorted Right: " + Math.floor((correct/itemsGone)*100) + "%";
    money+=5;
    moneyText.text = money + "$";
    if (money<0){
        moneyText.color = "#F00"
    } else {
        moneyText.color = "#0F0"
    }
    infoCanvas.update();
}
function windmillRotate(){
    if (roundsComplete>0)  {
        assets.windmill1.rotation++;
        moveCloud(assets.cloud1, -400, 1500);
    }
    if (roundsComplete>1) {
        assets.windmill2.rotation++;
        moveCloud(assets.cloud2, 1000, 900);
    }
    if (roundsComplete>2) {
        assets.windmill3.rotation++;
        moveCloud(assets.cloud3, -400, 2000);
        if (assets.cloud3.x == -400){
            nextLevel();
        }
    }
}

blinkObject(car);

function blinkObject(object){
    createjs.Tween.get(object)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200).call(function(){
        wrongBin.alpha = 0; //stupid workaround, should be fixed
    });
}
function onTick(e){
    if (lives > 0 && booleans.gameRunning) {
        if (!assets.grandma.init){
            runTimer();
        }
        if (assets.car.driving) {
            assets.car.x += carSpeed;
            carTire1.rotation += carSpeed;
            carTire2.rotation += carSpeed;
        }
        updateText();
        stage.update(e);
        if (!booleans.heroHit) {
            moveHero();
        }
        checkCollisions();
        windmillRotate();
        wrongBin.y = assets.hero.y - 35;
        wrongBin.x = assets.hero.x - 25;
        if (level > 3 && !assets.car.driving){
            var chance = Math.floor(Math.random()*200);
            if (chance === 1){
                stage.addChild(assets.car);
                assets.car.driving=true;
                console.log("incoming");
            }
        }
    } else if (lives <= 0 || !booleans.gameRunning){
            gameOver();
        }
    if (booleans.gameRunning && garbage < amount && booleans.stageMoved){
        if (!assets.grandma.active && !assets.grandma.init) {
            roundsComplete++;
        }
        if (roundsComplete < 3 && !assets.grandma.init){
            addGarbage();
        }
    }
}