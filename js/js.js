/**
 * Created by Hallur on 29-05-2016.
 */
var stage, hero, background, windmill1, windmill2, windmill3;
var recycleBinGlass, recycleBinPaper;
var queue, preloadText;
var bin = [];
var garbage = [];
var amount = 3;
var pickup = false;
var roundsComplete = 0;

var speedPowerUp = false;

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
    queue.on('complete', startGame);

    queue.loadManifest([
        {id:"background", src:"img/background.png"},
        {id:"paperBin", src:"img/green_bin.png"},
        {id:"glassBin", src:"img/blue_bin.png"},
        {id:"windmill", src:"img/mill_rotate.png"},
        {id:"glass", src:"img/glass.png"},
        {id:"paper", src:"img/paper.png"}
    ])
}

function loading (e){
    console.log(e.progress);
    preloadText.text = Math.round(e.progress*100) + "%";
    stage.update();
}

function startGame(){
    stage.removeChild(preloadText);
    window.addEventListener('keydown', fingerDown);
    window.addEventListener('keyup', fingerUp);

    background = new createjs.Bitmap(queue.getResult("background"));

    windmill1 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill1.width = 71;
    windmill1.height = 63;
    windmill1.regX = windmill1.width/2;
    windmill1.regY = 41;
    windmill1.x = 107;
    windmill1.y = 130;

    windmill2 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill2.width = 71;
    windmill2.height = 63;
    windmill2.regX = windmill2.width/2;
    windmill2.regY = 41;
    windmill2.x = 202;
    windmill2.y = 116;

    windmill3 = new createjs.Bitmap(queue.getResult("windmill"));
    windmill3.width = 71;
    windmill3.height = 63;
    windmill3.regX = windmill3.width/2;
    windmill3.regY = 41;
    windmill3.x = 297;
    windmill3.y = 126;

    hero = new createjs.Shape();
    hero.graphics.beginFill("#ff0000").drawRect(0, 0, 40, 90);
    hero.width = 40;
    hero.height = 90;
    hero.regX = hero.width/2;
    hero.regY = hero.height/2;
    hero.x = 20;
    hero.y = 400;
    hero.jump = false;
    hero.speed = 5;
    hero.garbage=null;
    hero.pickup=false;

    recycleBinPaper = new createjs.Bitmap(queue.getResult("paperBin"));
    recycleBinPaper.width = 53;
    recycleBinPaper.height = 68;
    recycleBinPaper.regX = recycleBinPaper.width/2;
    recycleBinPaper.regY = recycleBinPaper.height/2;
    recycleBinPaper.x = 600;
    recycleBinPaper.y = 430;
    recycleBinPaper.type = "paper";
    recycleBinPaper.touching = false;

    recycleBinGlass = new createjs.Bitmap(queue.getResult("glassBin"));
    recycleBinGlass.width = 53;
    recycleBinGlass.height = 68;
    recycleBinGlass.regX = recycleBinGlass.width/2;
    recycleBinGlass.regY = recycleBinGlass.height/2;
    recycleBinGlass.x = 600;
    recycleBinGlass.y = 280;
    recycleBinGlass.type = "glass";
    recycleBinGlass.touching = false;

    bin.push(recycleBinGlass, recycleBinPaper);
    stage.addChild(background, windmill1, windmill2, windmill3, recycleBinGlass, recycleBinPaper, hero);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', onTick);
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

        var random = Math.floor(Math.random()*2);

        switch (random) {
            case 0:
                stage.addChild(glass);
                garbage.push(glass);
                animateGarbage(garbage[i]);
                break;
            case 1:
                stage.addChild(paper);
                garbage.push(paper);
                animateGarbage(garbage[i]);
                break;
        }
    }
    amount+=3;
}

function animateGarbage(thing){
    for (var i = 0; i<amount; i++) {
        thing.y = -100 * i;
        createjs.Tween.get(thing)
            .to({y: Math.floor(Math.random() * 255 + 245), x: Math.floor(Math.random() * 450), rotation: Math.floor(Math.random() * 2000)}, 2000, createjs.circOut);
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
    }
    if(e.keyCode===38){
        keys.ukd=false;
    }
    if(e.keyCode===39){
        keys.rkd=false;
    }
    if(e.keyCode===40){
        keys.dkd=false;
    }
}
function fingerDown(e){
    if(e.keyCode===16 || speedPowerUp){
        keys.shiftkd=true;
    }
    if(e.keyCode===32){
        keys.spacekd=true;
    }
    if(e.keyCode===37){
        keys.lkd=true;
    }
    if(e.keyCode===38){
        keys.ukd=true;
    }
    if(e.keyCode===39){
        keys.rkd=true;
    }
    if(e.keyCode===40){
        keys.dkd=true;
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
                stage.removeChild(hero.garbage);
                hero.garbage=null;
                pickup=false;
            }
            if (bin[i].touching && hero.garbage && keys.spacekd && hero.garbage.type != bin[i].type){
                //ALERT
                console.log("wrong bin");
            }
        }
        if (keys.spacekd && !pickup) {
            for (var i = 0; i < garbage.length; i++) {
                if (hitTest(hero, garbage[i])) {
                    hero.garbage=garbage[i];
                    garbage[i].x = hero.x + 20;
                    garbage[i].y = hero.y - 40;
                    pickup=true;
                }
            }
        }
}

function nextLevel (){}

function onTick(e){
    stage.update(e);
    moveHero();
    checkCollisions();
    if (roundsComplete>1)  {
        windmill1.rotation++;
    }
    if (roundsComplete>2) {
        windmill2.rotation++;
    }
    if (roundsComplete>3) {
        windmill3.rotation++;
    }
    if (garbage == 0){
        addGarbage();
        roundsComplete++;
    }
}