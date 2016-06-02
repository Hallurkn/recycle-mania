/**
 * Created by Hallur on 29-05-2016.
 */
var stage, hero, background, windmill1, windmill2, windmill3, cloud1, cloud2, cloud3, sun, splash, firstSplash, congratsText;
var sound;
var nextLevel;
var queue, preloadText;
var bin = [];
var garbage = [];
var amount = 3;
var pickup = false;
var roundsComplete = -1;
var mistakes = 0;
var lives = 3;
var clicked = false;
var level = 1;
var gameRunning = false;
var done=true;

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
    preloadText = new createjs.Text("0%", "30px monospace", "#FFF");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', loading);
    queue.on('complete', splashScreen);

    queue.loadManifest([
        {id:"background", src:"img/background.png"},
        {id:"paperBin", src:"img/green_bin.png"},
        {id:"glassBin", src:"img/blue_bin.png"},
        {id:"compostBin", src:"img/red_bin.png"},
        {id:"windmill", src:"img/mill_rotate.png"},
        {id:"cloud", src:"img/cloud.png"},
        {id:"glass", src:"img/glass.png"},
        {id:"paper", src:"img/paper.png"},
        {id:"compost", src:"img/compost.png"},
        {id:"unmuted", src:"img/unmuted.png"},
        {id:"muted", src:"img/muted.png"},
        {id:"firstSplash", src:"img/splash_one.png"},
        {id:"splash", src:"img/splash.png"},
        {id:"nextLevel", src:"img/nextLevel.png"},
        {id:"heroSS", src:"js/sprite.json"},
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
    console.log(e.progress);
    preloadText.text = Math.round(e.progress*100) + "%";
    stage.update();
}
//Should rewrite this, DRY
function switchSound(){
    if (clicked) {
        sound.removeEventListener('click', switchSound);
        stage.removeChild(sound);
    }
    unmuteSounds();
    clicked = true;
    sound = new createjs.Bitmap(queue.getResult("unmuted"));
    sound.x = stage.canvas.width - 28;
    stage.addChild(sound);
    sound.addEventListener('click', otherSound);
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
    stage.removeChild(sound);
    muteSounds();
    sound = new createjs.Bitmap(queue.getResult("muted"));
    sound.x = stage.canvas.width - 28;
    stage.addChild(sound);
    sound.addEventListener('click', switchSound);
}
function splashScreen(){
    stage.removeChild(preloadText);
    window.addEventListener('keydown', fingerDown);
    window.addEventListener('keyup', fingerUp);
    createjs.Sound.play("parkSound", {loop:-1});

    background = new createjs.Bitmap(queue.getResult("background"));

    switchSound();

    windmill1 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill1.width = 71;
    windmill1.height = 63;
    windmill1.regX = windmill1.width/2;
    windmill1.regY = 41;
    windmill1.x = 106;
    windmill1.y = 130;

    windmill2 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill2.width = 71;
    windmill2.height = 63;
    windmill2.regX = windmill2.width/2;
    windmill2.regY = 41;
    windmill2.x = 200;
    windmill2.y = 116;

    windmill3 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill3.width = 71;
    windmill3.height = 63;
    windmill3.regX = windmill3.width/2;
    windmill3.regY = 41;
    windmill3.x = 296;
    windmill3.y = 126;

    var heroSpriteSheet = new createjs.SpriteSheet(queue.getResult("heroSS"));
    hero = new createjs.Sprite(heroSpriteSheet, 'standRight');
    hero.width = 33;
    hero.height = 45;
    hero.regX = hero.width/2;
    hero.regY = hero.height/2;
    hero.x = 20;
    hero.y = 400;
    hero.jump = false;
    hero.speed = 5;
    hero.garbage=null;
    hero.pickup=false;

    cloud1 = new createjs.Bitmap(queue.getResult('cloud'));
    cloud1.x = 200;
    cloud1.y = 10;

    cloud2 = new createjs.Bitmap(queue.getResult('cloud'));
    cloud2.x = 500;
    cloud2.y = 20;

    cloud3 = new createjs.Bitmap(queue.getResult('cloud'));
    cloud3.x = 20;
    cloud3.y = 20;

    sun = new createjs.Shape();
    sun.graphics.beginFill("#FCEF00").drawCircle(0,0,40);
    sun.x = 550;
    sun.y = 40;

    splash = new createjs.Bitmap(queue.getResult('splash'));
    splash.alpha = 1;
    splash.addEventListener('click', startLevel);

    firstSplash = new createjs.Bitmap(queue.getResult('firstSplash'));
    firstSplash.alpha=1;
    firstSplash.addEventListener('click', function(){
        firstSplash.removeEventListener('click');
        stage.removeChild(firstSplash);
        stage.addChild(splash);
        stage.update();
    });

    stage.addChild(background, sun, cloud1, cloud2, cloud3, windmill1, windmill2, windmill3, firstSplash, sound);
    stage.update();
}
function moveCloud (cloud, xValue, time){
    createjs.Tween.get(cloud)
        .to({x:xValue}, time, createjs.Ease.circIn)
}
function startLevel (){
    gameRunning = true;
    if (level == 1){
    createjs.Tween.get(splash)
        .to({alpha:0}, 0, createjs.Ease.circOut).call(function() {
        splash.removeEventListener('click', startLevel);
        })
    }

        //instructions for each level needed

        if (level > 1) {
            levelNext.removeEventListener('click', startLevel);
            stage.removeChild(levelNext, gratsText);
            hero.x = 20;
            hero.y = 400;
            cloud1.x = 200;
            cloud1.y = 10;
            cloud2.x = 500;
            cloud2.y = 20;
            cloud3.x = 20;
            cloud3.y = 20;
        }

        bin.push(createBin('paperBin', 'paper', 53, 68, 600, 450));
        bin.push(createBin('glassBin', 'glass', 53, 68, 600, 260));
        mistakesText = new createjs.Text("Mistakes made: " + mistakes, "30px monospace", "#fff");
        stage.addChild(mistakesText);
        livesText = new createjs.Text("Lives: " + lives, "30px monospace", "#fff");
        stage.addChild(livesText);
        livesText.y = 30;
        levelText = new createjs.Text("Current Level: " + level, "30px monospace", "#fff");
        stage.addChild(levelText);
        levelText.y = 60;

        wrongBin = new createjs.Text("WRONG BIN, +1 MISTAKE", "15px monospace", "#f00");

        stage.addChild(hero);

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', onTick);
        stage.update();
}
function createBin(name, type, width, height, x, y){
    var name = new createjs.Bitmap(queue.getResult(name));
    name.width = width;
    name.height = height;
    name.regX = name.width/2;
    name.regY = name.height/2;
    name.x = x;
    name.y = y;
    name.type = type;
    name.touching = false;
    stage.addChild(name);
    return name;
}
function addGarbage() {
    for (var i = 0; i < amount; i++) {
        var glass = new createjs.Bitmap(queue.getResult("glass"));
        glass.height = 52;
        glass.width = 17;
        glass.regX = glass.width/2;
        glass.regY = glass.height/2;
        glass.x = 300+Math.floor(Math.random()*20);
        glass.y = 350+Math.floor(Math.random()*20);
        glass.type = "glass";
        glass.touching = false;

        var paper = new createjs.Bitmap(queue.getResult("paper"));
        paper.height = 49;
        paper.width = 49;
        paper.regX = paper.width/2;
        paper.regY = paper.height/2;
        paper.x = 400+Math.floor(Math.random()*20);
        paper.y = 320+Math.floor(Math.random()*20);
        paper.type = "paper";
        paper.touching = false;

        var compost = new createjs.Bitmap(queue.getResult("compost"));
        compost.height = 49;
        compost.width = 49;
        compost.regX = compost.width/2;
        compost.regY = compost.height/2;
        compost.x = 400+Math.floor(Math.random()*20);
        compost.y = 320+Math.floor(Math.random()*20);
        compost.type = "compost";
        compost.touching = false;

        var random = Math.floor(Math.random()*2);

        if (level > 1) {
            bin.push(createBin('compostBin', 'compost', 53, 68, 430, 260));
            random = Math.floor(Math.random()*3);
        }

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
        }
    }
    amount+=level;
}

function animateGarbage(garbage, index){
        pickup=true;
        garbage.y = -100;
        createjs.Tween.get(garbage).wait(300*index)
            .wait(300).to({y: Math.floor(Math.random() * 255 + 245),
                x: Math.floor(Math.random() * 450),
                rotation: Math.floor(Math.random() * 2000)}, 1500, createjs.circOut).call(function(){
            pickup=false;
            createjs.Sound.play("fallingSound");
            garbage.dangerous = false;
        });

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
        hero.gotoAndStop("left");
    }
    if(e.keyCode===38){
        keys.ukd=false;
        hero.gotoAndStop("up");
    }
    if(e.keyCode===39){
        keys.rkd=false;
        hero.gotoAndStop("standRight");
    }
    if(e.keyCode===40){
        keys.dkd=false;
        hero.gotoAndStop("down");
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
        hero.gotoAndPlay("left");
    }
    if(e.keyCode===38){
        keys.ukd=true;
        hero.gotoAndPlay("up");
    }
    if(e.keyCode===39){
        keys.rkd=true;
        hero.gotoAndPlay("right");
    }
    if(e.keyCode===40){
        keys.dkd=true;
        hero.gotoAndPlay("down");
    }
}
function moveHero(){
    if(keys.shiftkd) {
        hero.speed=9;
    } else {
        hero.speed=5;
    }
    if(keys.rkd){
        hero.x+=hero.speed;
        if (hero.garbage) {
            hero.garbage.x += hero.speed;
        }
    }
    if(keys.lkd){
        hero.x-=hero.speed;

        if (hero.garbage) {
            hero.garbage.x -= hero.speed;
        }
    }
    if(keys.ukd){
        hero.y-=hero.speed;
        if (hero.garbage) {
            hero.garbage.y -= hero.speed;
        }
    }
    if(keys.dkd){
        hero.y+=hero.speed;
        if (hero.garbage) {
            hero.garbage.y += hero.speed;
        }
    }

    // Not move out of top of Canvas
    if (hero.y < 245) {
        hero.y += hero.speed;
        hero.y = 245;
        if (hero.garbage) {
            hero.garbage.y += hero.speed;
        }
    }
    // Not move out of bottom of Canvas
    if (hero.y+hero.height/2 > stage.canvas.height) {
        hero.y-=hero.speed;
        hero.y = stage.canvas.height - hero.regY;
        if (hero.garbage) {
            hero.garbage.y -= hero.speed;
        }
    }
    // Not move out of left side of Canvas
    if (hero.x < 0 - hero.width/2) {
        hero.x += hero.speed;
        hero.x = stage.canvas.width + hero.regX;
        if (hero.garbage) {
            hero.garbage.x = hero.x+20;
        }
    }
    // Not move out of right side of Canvas
    if (hero.x-hero.width/2 > stage.canvas.width) {
        hero.x-=hero.speed;
        hero.x = -hero.regX;
        if (hero.garbage) {
            hero.garbage.x = hero.x+20;
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
            if (hitTest(hero, bin[i])) {
                bin[i].touching = true;
                console.log(bin[i].touching);
            } else {
                bin[i].touching = false;
            }
            if (bin[i].touching && hero.garbage && keys.spacekd && hero.garbage.type == bin[i].type){
                var index = garbage.indexOf(hero.garbage);
                garbage.splice(index,1);
                createjs.Sound.play("paperSound");
                stage.removeChild(hero.garbage);
                hero.garbage=null;
                pickup=false;
            }
            if (bin[i].touching && hero.garbage && keys.spacekd && hero.garbage.type != bin[i].type){
                var index = garbage.indexOf(hero.garbage);
                garbage.splice(index,1);
                createjs.Sound.play("wrongSound"); //needs to be fixed, only works when touching
                stage.removeChild(hero.garbage);
                hero.garbage=null;
                pickup=false;
                console.log("wrong bin");
                stage.addChild(wrongBin);
                blinkObject(wrongBin);
                mistakes++;
            }
        }
        if (keys.spacekd && !pickup) {
            for (var i = 0; i < garbage.length; i++) {
                if (hitTest(hero, garbage[i])) {
                    hero.garbage=garbage[i];
                    garbage[i].x = hero.x + 20;
                    garbage[i].y = hero.y - 10;
                    pickup=true;
                }
            }
        }

        for (var i = 0; i < garbage.length; i++) {
            if (hitTest(hero, garbage[i]) && garbage[i].dangerous) {
                garbage[i].dangerous = false;
                blinkObject(hero);
                lives--;
            }
        }
}
function blinkObject(object){
    createjs.Tween.get(object)
        .to({alpha:0.5}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.5}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.5}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200).call(function(){
        wrongBin.alpha = 0; //stupid workaround, should be fixed
    });
}
function nextLevel (){
    gameRunning = false;
    stage.removeAllChildren();
    garbage = [];
    bin = [];
    createjs.Sound.play("winSound");

    gratsText = new createjs.Text("Congratulations, you completed level " + "!", "30px monospace", "#fff");
    gratsText.textBaseline = "middle";
    gratsText.textAlign = "center";
    gratsText.x = stage.canvas.width/2;
    gratsText.y = stage.canvas.height/2;

    amount = 3 + level;
    mistakes = 0;
    roundsComplete=-1;

    stage.addChild(background, sun, cloud1, cloud2, cloud3, windmill1, windmill2, windmill3, sound);
    stage.addChild(gratsText);
    level++;
    levelNext = new createjs.Bitmap(queue.getResult('nextLevel'));
    stage.addChild(levelNext);
    levelNext.addEventListener('click', startLevel);
    stage.update();
}
function windmillRotate(){
    if (roundsComplete>0)  {
        windmill1.rotation++;
        blinkObject(windmill1);
        moveCloud(cloud1, -400, 1500);
    }
    if (roundsComplete>1) {
        windmill2.rotation++;
        blinkObject(windmill2);
        moveCloud(cloud2, 800, 900);
    }
    if (roundsComplete>2) {
        windmill3.rotation++;
        blinkObject(windmill3);
        moveCloud(cloud3, -400, 2000);
        if (cloud3.x == -400){
            nextLevel();
        }
    }
}
function updateText(){
    mistakesText.text = "Mistakes made: " + mistakes;
    livesText.text = "Lives: " + lives;
    levelText.text = "Current Level: " + level;
}

function gameOver(){
    //createjs.Sound.play("loseSound");
    //TryAgain code needs to be done
}

function onTick(e){
    if (mistakes < 3 && lives > 0 && gameRunning) {
        updateText();
        stage.update(e);
        moveHero();
        checkCollisions();
        windmillRotate();
        wrongBin.y = hero.y - 25;
        wrongBin.x = hero.x - 25;
    } else {
        if (done == true){
            gameOver();
            done=false;
        }
    }
    if (mistakes > 2) {
        gameOver();
    }
    if (gameRunning && garbage < amount){
        roundsComplete++;
        console.log(roundsComplete);
        if (roundsComplete < 3){
            addGarbage();
        }

    }
}