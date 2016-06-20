/**
 * Created by Hallur on 29-05-2016.
 */
//STAGE Stuff
var stage, infoCanvas, shopMenu, splashPage;
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
    sun: {}
}
var bin = [];
var garbage = [];
var carBody, carTire1, carTire2;
//MISC
var queue;
//SETTINGS + Gameplay
var settings = {
    sound: undefined,
    amount: 3,
    money: 0,
    roundsComplete: -1,
    itemsGone: 0,
    correct: 0,
    completeNeeded: 70,
    completeCalc: undefined,
    level: 1,
    random: undefined,
    carSpeed: 7,
    throwSpeed: 1200,
    bossSpeed: 3
}
//BOOLS - variables created to control the logic
var booleans = {
    levelDone: false,
    blinkGarbage: false,
    pickup: false,
    carDriving: false,
    heroHit: false,
    clicked: false,
    gameRunning: false,
    stageMoved: false,
    binWarning: false,
}
//POWERUPS
var powerup = {
    phone: false,
    defyPhysics: false,
    shoes : 0, //The amount of speed added to the hero when he buys shoes, gets +1 when bought.
    medicine : 14 //timer that starts at 14 seconds for every item
}
//HERO CONTROLS
var keys = {
    ckd:false,
    spacekd:false,
    rkd:false,
    lkd:false,
    ukd:false,
    dkd:false
};

//PRELOADER
function preload(){
    stage = new createjs.Stage("canvas");
    infoCanvas = new createjs.Stage("second")
    preloadText = new createjs.Text("0%", "100px Bangers", "#FFF");
    preloadText.textBaseline = "middle";
    preloadText.textAlign = "center";
    preloadText.x = stage.canvas.width/2;
    preloadText.y = stage.canvas.height/2;
    stage.addChild(preloadText);

    //Silly loading text, defined in loading
    stupidText = new createjs.Text("Initializing game", "70px Bangers", "#FFF");
    stupidText.textBaseline = "middle";
    stupidText.textAlign = "center";
    stupidText.x = stage.canvas.width/2;
    stupidText.y = stage.canvas.height/2 + 80;
    stage.addChild(stupidText);

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', loading);
    queue.on('complete', setupLevel);

    queue.loadManifest([
        {id:"shopScreen", src:"img/shopMenu.png"},
        {id:"continueButton", src:"img/continue.png"},
        {id:"buyButton", src:"img/buyButton.png"},
        {id:"background", src:"img/background.png"},
        {id:"splashPage", src:"img/splashPage.png"},
        {id:"instructionsPage", src:"img/instructionsPage.png"},
        {id:"paperBin", src:"img/green_bin.png"},
        {id:"glassBin", src:"img/blue_bin.png"},
        {id:"compostBin", src:"img/red_bin.png"},
        {id:"electronicsBin", src:"img/yellow_bin.png"},
        {id:"glass", src:"img/glass.png"},
        {id:"paper", src:"img/paper.png"},
        {id:"compost", src:"img/compost.png"},
        {id:"electronics", src:"img/electronics.png"},
        {id:"windmill", src:"img/mill_rotate.png"},
        {id:"cloud", src:"img/cloud.png"},
        {id:"carBody", src:"img/carBody.png"},
        {id:"carTire", src:"img/carTire.png"},
        {id:"restart", src:"img/restart.png"},
        {id:"unmuted", src:"img/unmuted.png"},
        {id:"muted", src:"img/muted.png"},
        {id:"physics", src:"img/physics.png"},
        {id:"phone", src:"img/phone.png"},
        {id:"medicine", src:"img/medicine.png"},
        {id:"shoes", src:"img/shoes.png"},
        {id:"heroSS", src:"js/sprite.json"},
        {id:"grandmaSS", src:"js/spriteGrandma.json"},
        {id:"boss", src:"img/boss.png"},
        {id:"buyItem", src:"sound/buyItem.mp3"},
        {id:"throwSound", src:"sound/throw.mp3"},
        {id:"carDriving", src:"sound/cardrive.wav"},
        {id:"carHit", src:"sound/carHit.mp3"},
        {id:"bodyHit", src:"sound/bodyHit.mp3"},
        {id:"winSound", src:"sound/win.mp3"},
        {id:"winGame", src:"sound/winGame.mp3"},
        {id:"message", src:"sound/message.mp3"},
        {id:"loseSound", src:"sound/lose.mp3"},
        {id:"wrongSound", src:"sound/wrong.wav"},
        {id:"paperSound", src:"sound/garbage.wav"},
        {id:"parkSound", src:"sound/troll.mp3"},
        {id:"bossSound", src:"sound/ufo.mp3"},
        {id:"bossLaugh", src:"sound/bossLaugh.mp3"},
        {id:"grandmaSound", src:"sound/grandma.wav"}
    ])
}
function loading (e){
    var preloadCalc = Math.round(e.progress*100);
    preloadText.text = preloadCalc + "%";
    //Animates canvas color at the end of the load
    if (preloadCalc > 94){
        document.querySelector('#canvas').classList.add('changeColor');
    }
    //Silly loading text
    if (preloadCalc > 90 && preloadCalc < 100) {
        stupidText.text = "Fetching grandpa's medicine...";
    } else if (preloadCalc > 80 && preloadCalc < 90) {
        stupidText.text = "Calling grandma...";
    } else if (preloadCalc > 70 && preloadCalc < 60){
        stupidText.text = "Tying shoelaces...";
    } else if (preloadCalc > 60 && preloadCalc < 50){
        stupidText.text = "Clapping my hands...";
    } else if (preloadCalc > 50 && preloadCalc < 40){
        stupidText.text = "Doing homework...";
    } else if (preloadCalc < 10 && preloadCalc > 1){
        stupidText.text = "Painting skies...";
    }
    stage.update();
}

//SOUND & RESTART - Switches the event listener & image for the sound icon + adds the restart button
function setupSoundAndRestart(){
    if (booleans.clicked) {
        settings.sound.removeEventListener('click', setupSoundAndRestart);
        infoCanvas.removeChild(settings.sound);
    }
    unmuteSounds();
    booleans.clicked = true;

    settings.restart = new createjs.Bitmap(queue.getResult("restart"));
    settings.restart.width=28;
    settings.restart.regX=settings.restart.width/2;
    settings.restart.x = infoCanvas.canvas.width/4 * 3;
    settings.restart.y = 20;
    settings.restart.addEventListener('click', restartGame);

    settings.sound = new createjs.Bitmap(queue.getResult("unmuted"));
    settings.sound.width=28;
    settings.sound.regX=settings.sound.width/2;
    settings.sound.x = infoCanvas.canvas.width/4;
    settings.sound.y = 20;
    settings.sound.addEventListener('click', otherSound);

    infoCanvas.addChild(settings.sound, settings.restart);
    infoCanvas.update();
}
function muteSounds(){
    createjs.Sound.muted=true;
}
function unmuteSounds(){
    createjs.Sound.muted=false;
}
function otherSound() {
    settings.sound.removeEventListener('click', otherSound);
    infoCanvas.removeChild(settings.sound);

    muteSounds();

    settings.sound = new createjs.Bitmap(queue.getResult("muted"));
    settings.sound.width=28;
    settings.sound.regX=settings.sound.width/2;
    settings.sound.x = infoCanvas.canvas.width/4;
    settings.sound.y = 20;
    infoCanvas.addChild(settings.sound);
    settings.sound.addEventListener('click', setupSoundAndRestart);
    infoCanvas.update();
}

//RESTARTS GAME - Resets all gameplay settings to their initial value and starts game again.
function restartGame(){
    stage.removeAllChildren();
    infoCanvas.removeAllChildren();
    booleans.levelDone=false;
    booleans.blinkGarbage=false;
    booleans.pickup=false;
    booleans.carDriving=false;
    booleans.heroHit=false;
    booleans.clicked=false;
    booleans.gameRunning=false;
    booleans.stageMoved=false;
    booleans.binWarning=false;

    powerup.phone=false;
    powerup.defyPhysics=false;
    powerup.shoes=0;
    powerup.medicine=15;

    settings.amount=3;
    settings.money=0;
    settings.roundsComplete=-1;
    settings.itemsGone=0;
    settings.correct=0;
    settings.completeNeeded=70;
    settings.level=1;
    settings.carSpeed=7;
    settings.throwSpeed=1500;
    settings.bossSpeed=3;

    bin=[];
    garbage=[];
    setupLevel();
}

//Sets up level for the first time
function setupLevel(){
    stage.y = 1050;
    setupSoundAndRestart();
    stage.removeChild(preloadText);

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

    assets.car = new createjs.Container();
    assets.car.width = 269;
    assets.car.height = 55;
    assets.car.regY = 70;
    assets.car.x = -800;
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

    assets.boss = new createjs.Bitmap(queue.getResult('boss'));
    assets.boss.width = 179;
    assets.boss.height = 144;
    assets.boss.regX=assets.boss.width/2;
    assets.boss.x = stage.canvas.width/2;
    assets.boss.y = -1400;
    assets.boss.regX = assets.boss.width/2;

    
    var heroSpriteSheet = new createjs.SpriteSheet(queue.getResult("heroSS"));
    assets.hero = new createjs.Sprite(heroSpriteSheet, 'standRight');
    assets.hero.width = 64;
    assets.hero.height = 64;
    assets.hero.regX = assets.hero.width/2;
    assets.hero.regY = assets.hero.height/2;
    assets.hero.x = 300;
    assets.hero.y = 500;
    assets.hero.speed = 4;
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

    binText = new createjs.Text();

    levelText = new createjs.Text("Level: " + settings.level, "45px Bangers", "#000");
    levelText.y = 60;
    levelText.x = 100;
    levelText.textAlign = "center";
    moneyText = new createjs.Text(settings.money + "$", "45px Bangers");
    if (settings.money < 0) {
        moneyText.color = "#F00"
    } else {
        moneyText.color = "#0F0"
    }
    moneyText.y = 125;
    moneyText.x = 100;
    moneyText.textAlign = "center";
    completeText = new createjs.Text("Sorted Right: 0%", "25px Bangers", "#000");
    completeText.y = 190;
    completeText.x = 100;
    completeText.textAlign = "center";
    assetsText = new createjs.Text("ASSETS", "35px Bangers", "#000");
    assetsText.y = 300;
    assetsText.x = 100;
    assetsText.textAlign = "center";
    //Create funciton createAsset later
    function createAsset(img, yValue, xValue){
        temp = new createjs.Bitmap(queue.getResult(img));
        temp.width=44;
        temp.height=44;
        temp.regX=temp.width/2;
        temp.y=yValue;
        temp.x=xValue;
        temp.alpha=0.2;
        return temp;
    }
    physicsAsset=createAsset("physics", 350, 50);
    phoneAsset=createAsset("phone", 350, 150);
    medicineAsset=createAsset("medicine", 420, 50);
    shoesAsset=createAsset("shoes", 420, 150);

    //Adding the assets, placement important
    stage.addChild(assets.background, assets.sun, assets.cloud1, assets.cloud2, assets.cloud3,
        assets.windmill1, assets.windmill2, assets.windmill3);

    // Initial splash screen
    createjs.Sound.stop("parkSound");
    splashScreen = new createjs.Bitmap(queue.getResult("splashPage"));
    splashScreen.y = -1050;
    continueButton = new createjs.Bitmap(queue.getResult("continueButton"));
    continueButton.width = 445;
    continueButton.regX = continueButton.width/2;
    continueButton.x = stage.canvas.width/2;
    continueButton.y = -610;
    continueButton.addEventListener('click', nextSplash);
    stage.addChild(splashScreen, continueButton);
    stage.update();
    function nextSplash(){
        continueButton.removeEventListener('click', nextSplash);
        stage.removeChild(splashScreen);
        splashScreen = new createjs.Bitmap(queue.getResult("instructionsPage"));
        splashScreen.y = -1050;
        stage.addChild(splashScreen, continueButton);
        continueButton.addEventListener('click', startLevel);
        stage.update();
    }

}

//Function that starts the level, after every level is done and when it's first started
function startLevel () {
    continueButton.removeEventListener('click', startLevel);
    stage.removeChild(splashScreen, continueButton);
    if (!booleans.stageMoved) {
        animateStage();
    } else {
        keepGoingBoss();
    }
    createjs.Sound.play("parkSound", {loop:-1});

    //Workaraound for testing
    /*booleans.levelDone=true;
    stage.y = 0;
    booleans.stageMoved=true;
    assets.boss.x = stage.canvas.width - assets.boss.width/2;
    assets.boss.y = 0;
    keepGoingBoss();*/

    if (booleans.stageMoved){
        booleans.levelDone=true; //Workaround for the updateText function to display a certain text at "sorted right".
        updateText();
        booleans.levelDone=false;
        booleans.gameRunning=true;
    }

    bin.push(createBin('paperBin', 'paper', 53, 68, 630, 500));
    bin.push(createBin('glassBin', 'glass', 53, 68, 630, 280));

    infoCanvas.addChild(moneyText, completeText, assetsText, levelText, physicsAsset, phoneAsset, medicineAsset, shoesAsset, settings.sound, settings.restart);
    infoCanvas.update();

    if (settings.level > 1) {
        bin.push(createBin('compostBin', 'compost', 53, 68, 230, 280));
    }

    if (settings.level > 2) {
        bin.push(createBin('electronicsBin', 'electronics', 53, 68, 230, 500));
    }

    if (settings.level > 3) {
        settings.carSpeed+=2;
    }

    stage.addChild(assets.hero, assets.boss);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', onTick);
    stage.update();

}

//CREATE FUNCTIONS - Functions made to create assets with simple paramaters passed through
function createCloud(x, y){
    var c = new createjs.Bitmap(queue.getResult('cloud'));
    c.x = x;
    c.y = y;
    return c;
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
    g.x = assets.boss.x;
    g.y = assets.boss.y;
    g.type = type;
    g.touching = false;
    g.pickup = false;
    g.blinkGarbage = false;
    return g;
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

//NIMATE FUNCTIONS//

//Animates the stage, intro to the game where boss flies down
function animateStage (){
    animateBoss();
    createjs.Sound.play("bossSound");
    createjs.Tween.get(stage).wait(300)
        .to({y:0}, 5600, createjs.Ease.cubicInOut).call(function(){
        createjs.Sound.play("message");
        swal({
            title: "Level " + settings.level + "!",
            text: "In order to pass for the next level you need " + settings.completeNeeded +"% sorted right! You can do it!",
            showConfirmButton: true,
            confirmButtonText: "Accept",
            type: "warning",
            closeOnConfirm: false
        }, function () {
            createjs.Sound.play("message");
            swal({
                title: "Get ready",
                text: "Garbage will fall from the sky.. ",
                showConfirmButton: true
            },function(){
                booleans.stageMoved=true;
                booleans.gameRunning=true;
            });
        });

    });
}
//Animates the boss's initial animation, passes it on to the movement in the clouds which is the next function
function animateBoss(){
    createjs.Tween.get(assets.boss)
        .to({y:-400, x: stage.canvas.width, rotation:900}, 2400,  createjs.circInOut)
        .to({y:0, x: stage.canvas.width/2, rotation:1800}, 2400, createjs.circInOut).call(function(){
        assets.boss.regX=assets.boss.width/2;
        keepGoingBoss();
    })
}
//Boss animation that is part of the gameplay
function keepGoingBoss(){
    assets.boss.x+=settings.bossSpeed;
    if (assets.boss.x > stage.canvas.width - assets.boss.width/2 || assets.boss.x < 0 + assets.boss.width/2){
        settings.bossSpeed*=-1;
    }
}
//Animation that moves one cloud when one round is done
function moveCloud (cloud, xValue, time){
    createjs.Tween.get(cloud)
        .to({x:xValue}, time, createjs.Ease.circIn)
}
function blinkObject(object){
    createjs.Tween.get(object)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200).call(function(){
        binText.alpha = 0; //stupid workaround, should be fixed
    });
}
function blinkGarbage(object){
    createjs.Tween.get(object)
        .to({alpha:0.2}, 100, createjs.Ease.linear).wait(200)
        .to({alpha:1}, 100, createjs.Ease.linear).wait(200).call(function(){
            if (object.timer > 0 && assets.hero.garbage != object && !object.pickup && !assets.grandma.init){
                blinkGarbage(object);
            }
    });
}

function animateGrandma(){
    stage.addChild(assets.grandma);
    assets.grandma.init=true;
    powerup.grandma=false;
    updateText();
    createjs.Sound.play("grandmaSound");
    createjs.Tween.get(assets.grandma).wait(1400)
        .to({x: stage.canvas.width/2-assets.grandma.width/2}, 2500, createjs.circOut).call(function(){
        assets.grandma.active=true;
    }).wait(500)
        .to({x: -assets.grandma.width}, 2500, createjs.circOut).call(function(){
        assets.grandma.x = stage.canvas.width + assets.grandma.width;
        assets.grandma.active=false;
        assets.grandma.init=false;
        stage.removeChild(assets.grandma);
    });
}

//Introduces new elements in the levels with alerts.
function levelIntro() {
    stage.removeChild(shopMenu);
    continueButton.removeEventListener('click', levelIntro);
    assets.boss.x = stage.canvas.width - assets.boss.width/2;
    assets.boss.y = 0;
    if (settings.level == 1){
        createjs.Sound.play("message");
        booleans.gameRunning = false;
        swal({
            title: "Get ready",
            text: "Garbage will fall from the sky.. ",
            showConfirmButton: true
        },function(){
            booleans.gameRunning=true;
            startLevel();
            keepGoingBoss();
        });
    }
    if (settings.level == 2) {
        createjs.Sound.play("message");
        booleans.gameRunning = false;
        swal({
            title: "Level " + settings.level + "!",
            text: "In order to pass for the next level you need " + settings.completeNeeded +"% sorted right! You can do it!",
            showConfirmButton: true,
            confirmButtonText: "Accept",
            type: "success",
            closeOnConfirm: false
        }, function () {
            createjs.Sound.play("message");
            swal({
                title: "New bin!",
                text: "Beware of the new bin! It will only accept banana peels..",
                showConfirmButton: true,
                confirmButtonColor: "#0F0",
                confirmButtonText: "Got it!",
                imageUrl: "img/red_bin.png"
            }, function () {
                booleans.gameRunning = true;
                startLevel();
                keepGoingBoss();
            });
        });

    }
    if (settings.level == 3) {
        createjs.Sound.play("message");
        booleans.gameRunning = false;
        swal({
            title: "Level " + settings.level + "!",
            text: "In order to pass for the next level you need " + settings.completeNeeded +"% sorted right! You can do it!",
            showConfirmButton: true,
            confirmButtonText: "Accept",
            type: "success",
            closeOnConfirm: false
        }, function () {
            createjs.Sound.play("message");
            swal({
                title: "New Bin!",
                text: "Beware of the new bin! It will only take battaries..",
                imageUrl: "img/yellow_bin.png",
                showConfirmButton: true,
                confirmButtonText: "Accept",
                closeOnConfirm: false
            }, function () {
                createjs.Sound.play("message");
                swal({
                    title: "Traffic's coming!",
                    text: "Be careful when you pass the street. Cars will start driving. Be cautious when you hear a car, cause you might get hit and " +
                    "severely injure yourself..",
                    imageUrl: "img/carBody.png",
                    confirmButtonColor: "#0F0",
                    confirmButtonText: "Got it!",
                    showConfirmButton: true
                }, function () {
                    booleans.gameRunning = true;
                    startLevel();
                    keepGoingBoss();
                });
            });
        });
    }
    if (settings.level == 4){
        createjs.Sound.play("message");
        booleans.gameRunning = false;
        swal({
            title: "Level " + settings.level + "! The Final One!",
            text: "Good job, you have done a great job cleaning the city, and you now face your ultimate challenge...",
            imageUrl: "img/success.png",
            showConfirmButton: true,
            confirmButtonText: "Accept",
            closeOnConfirm: false
        }, function () {
            createjs.Sound.play("message");
            swal({
                title: "Pollutus is furious!",
                text: "Your recycling sent Pollutus into a furious rage, and he's littering like a madman! Recycle the garbage he " +
                "throws in order to defeat him!",
                imageUrl: "img/boss.png",
                showConfirmButton: true,
                confirmButtonColor: "#0F0",
                confirmButtonText: "Let's do it!"
            }, function () {
                booleans.gameRunning = true;
                startLevel();
                keepGoingBoss();
            });
        });
    }
}

//Unused function - Can be used later on for a more complex boss level
function bossLevel(){

}

//Checks if powerups are active and adds them to the asset
function checkPowerUp (){
    if (powerup.defyPhysics){
        physicsAsset.alpha=1;
    } else {
        physicsAsset.alpha=0.2;
    }
    if (powerup.phone){
        phoneAsset.alpha=1;
    } else {
        phoneAsset.alpha=0.2;
    }
    if (powerup.medicine>14){
        medicineAsset.alpha=1;
    } else {
        medicineAsset.alpha=0.2;
    }
    if (powerup.shoes>0){
        shoesAsset.alpha=1;
    } else {
        shoesAsset.alpha=0.2;
    }
    infoCanvas.update();
}

//Hero movement
function moveHero(){
    function fingerUp(e){
        if(e.keyCode===67){
            keys.ckd=false;
        }
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
        if(e.keyCode===67){
            keys.ckd=true;
        }
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
    if (booleans.gameRunning) {
        window.addEventListener('keydown', fingerDown);
        window.addEventListener('keyup', fingerUp);
    } else {
        window.removeEventListener('keydown', fingerDown);
        window.removeEventListener('keyup', fingerUp);
    }

    if(keys.ckd && powerup.phone){
        powerup.phone=false;
        animateGrandma();
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
    if (assets.hero.x < 0 - assets.hero.width/2 && powerup.defyPhysics) {
        assets.hero.x += assets.hero.speed;
        assets.hero.x = stage.canvas.width + assets.hero.regX;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    } else if (assets.hero.x < 0 + assets.hero.width/4 && !powerup.defyPhysics) {
        assets.hero.x += assets.hero.speed;
        assets.hero.x = 0 + assets.hero.width/4;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    }


    // Not move out of right side of Canvas
    if (assets.hero.x-assets.hero.width/2 > stage.canvas.width && powerup.defyPhysics) {
        assets.hero.x-=assets.hero.speed;
        assets.hero.x = -assets.hero.regX;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    } else if (assets.hero.x+assets.hero.width/4 > stage.canvas.width && !powerup.defyPhysics){
        assets.hero.x-=assets.hero.speed;
        assets.hero.x = stage.canvas.width-assets.hero.width/4;
        if (assets.hero.garbage) {
            assets.hero.garbage.x = assets.hero.x+20;
        }
    }
}

//Main gameplay function that adds garbage after every round and level
function addGarbage() {
    for (var i = 0; i < settings.amount; i++) {
        var glass=createGarbage('glass', 17, 52);
        var paper=createGarbage('paper', 49, 49);
        var compost=createGarbage('compost', 49, 49);
        var electronics=createGarbage('electronics', 49, 49);

        settings.random = Math.floor(Math.random()*2);
        if (settings.level > 1 ) {
            settings.random = Math.floor(Math.random() * 3);
        }
        if (settings.level > 2 ) {
            settings.random = Math.floor(Math.random() * 4);
        }

        switch (settings.random) {
            case 0:
                garbage.push(glass);
                garbage[i].dangerous = true;
                break;
            case 1:
                garbage.push(paper);
                garbage[i].dangerous = true;
                break;
            case 2:
                garbage.push(compost);
                garbage[i].dangerous = true;
                break;
            case 3:
                garbage.push(electronics);
                garbage[i].dangerous = true;
                break;
        }
    }

    //Animates the garbage into play
    function startAnimations(){
        var animationIndex = garbage.length-1;

        function go(){
            createjs.Sound.play("throwSound");
            stage.addChild(garbage[animationIndex]);
            garbage[animationIndex].startTime = (new Date()).getTime();
            garbage[animationIndex].pickup=true;
            garbage[animationIndex].y = assets.boss.y+120;
            garbage[animationIndex].x = assets.boss.x;
            createjs.Tween.get(garbage[animationIndex])
                .to({y: Math.floor(Math.random() * 255 + 275),
                    x: Math.floor(Math.random() * 600),
                    rotation: Math.floor(Math.random() * 2000)}, settings.throwSpeed, createjs.circOut).call(function(){
                garbage[animationIndex].pickup=false;
                garbage[animationIndex].dangerous = false;
                animationIndex--;
                if(animationIndex>=0){
                    go();
                }
            });
        }
        go();
    }
    settings.amount+=settings.level;
    startAnimations();
}

//Hitest + collision check. Counts in every single collision in the game, including grandma and car.
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
            if (!booleans.binWarning){
                var started = ((new Date()).getTime());
                booleans.binWarning=true;
                booleans.gameRunning=false;
                createjs.Sound.play("message");
                swal({
                    title: "Woops!",
                    text: "Make sure to sort the garbage into the right bin. " +
                    '<span style="color:#F00; font-weight:700;">' + assets.hero.garbage.type.toUpperCase() + "</span>"
                    + " does not go into this bin.",
                    showConfirmButton: true,
                    type: "warning",
                    html: true
                },function(){
                    var ended = ((new Date()).getTime());
                    var garbageIndex = garbage.length-1;
                    function timer(){
                        garbage[garbageIndex].startTime += ended - started;
                        garbageIndex--;
                        console.log(garbage[(garbageIndex+1)].timer);
                        if(garbageIndex>=0){
                            timer();
                        }
                    }
                    timer();
                    booleans.gameRunning=true;
                    keepGoingBoss();
                });
            }
            noMoney();
            stage.addChild(binText);
            blinkObject(binText);
            binText.text = "WRONG BIN!";
            binText.color = "#F00";
            binText.font = "30px Bangers";
            garbage.splice(index,1);
            if (booleans.binWarning) {
                createjs.Sound.play("wrongSound");
            }
            stage.removeChild(assets.hero.garbage);
            assets.hero.garbage=null;
            booleans.pickup=false;
        }
    }

    for (var i = 0; i < garbage.length; i++) {
        if ((keys.spacekd && !booleans.pickup) && hitTest(assets.hero, garbage[i]) && !garbage[i].pickup && !booleans.pickup) {
            assets.hero.garbage = garbage[i];
            booleans.pickup = true;
            garbage[i].timer = 0;
            if (booleans.pickup && !booleans.heroHit) {
                garbage[i].x = assets.hero.x + 20;
                garbage[i].y = assets.hero.y - 10;
            }
        }
        if (assets.grandma.active) {
            createjs.Tween.get(garbage[i])
                .to({x: assets.grandma.x, y: assets.grandma.y}, 500, createjs.Ease.linear).call(function () {
            });
            if (hitTest(garbage[i], assets.grandma)) {
                stage.removeChild(garbage[i]);
                garbage.splice(i, 1);
                settings.correct++;
                settings.itemsGone++;
                updateText();
            }
        }
        if ((garbage.length != 0 && booleans.gameRunning) && !assets.grandma.init && garbage[i].stage !== null) {
            garbage[i].currentTime = ((new Date()).getTime());
            garbage[i].timer = Math.floor((garbage[i].startTime - garbage[i].currentTime) / 1000) + powerup.medicine;
            if (garbage[i].timer <= 0 && assets.hero.garbage != garbage[i]) {
                garbage[i].currentTime = 1000000000;
                stage.removeChild(garbage[i]);
                garbage.splice(i, 1);
                noMoney();
                break;
            }
            if (garbage[i].timer < 5 && assets.hero.garbage != garbage[i] && !garbage[i].blinkGarbage) {
                garbage[i].blinkGarbage = true;
                blinkGarbage(garbage[i]);
            }
        }
    }

    // CAR STUFF
    if (settings.level > 2 && !assets.car.driving) {
        var chance = Math.floor(Math.random() * 250);
        if (chance === 1) {
            stage.addChild(assets.car);
            assets.car.driving = true;
            createjs.Sound.play("carDriving");
        }
    }
    if (assets.car.driving){
        booleans.carDriving=true;
        assets.car.x += settings.carSpeed;
        carTire1.rotation += settings.carSpeed;
        carTire2.rotation += settings.carSpeed;
        if (hitTest(assets.hero, assets.car) && assets.car.dangerous){
            createjs.Sound.play("bossLaugh");
            createjs.Sound.play("carHit");
            createjs.Sound.play("bodyHit");
            keys.spacekd=false;
            booleans.heroHit=true;
            booleans.pickup=false;
            assets.hero.garbage=null;
            blinkObject(assets.hero);
            createjs.Tween.get(assets.hero)
                .to({x:Math.floor(Math.random()*stage.canvas.width), y: 500, rotation: 1440}, 1000, createjs.Ease.linear).call(function(){
                booleans.heroHit = false;
                assets.hero.rotation = 0;
            });
            assets.car.dangerous=false;
        }
        if (assets.car.x > stage.canvas.width && !booleans.gameRunning){
            assets.car.driving=false;
            assets.car.x = -800;
            assets.car.y = 320 + Math.floor(Math.random()*90);
            stage.removeChild(assets.car);
            assets.car.dangerous=true;
        }
    }
}

//Adds to the "sorted right" text + gives feedback when you hand in the garbage into the bin(money/text).
function noMoney() {
    settings.itemsGone++;
    settings.completeCalc = Math.floor((settings.correct/settings.itemsGone)*100);
    updateText();
}
function gainMoney() {
    binText.text = "+5$";
    binText.color = "#0F0";
    binText.font = "30px Bangers";
    stage.addChild(binText);
    blinkObject(binText);
    settings.itemsGone++;
    settings.correct++;
    settings.completeCalc = Math.floor((settings.correct/settings.itemsGone)*100);
    settings.money+=5;
    updateText();
}

//Rotates the windmills and goes to next level
function windmillRotate(){
    if (settings.roundsComplete>0)  {
        assets.windmill1.rotation++;
        moveCloud(assets.cloud1, -400, 1500);
    }
    if (settings.roundsComplete>1) {
        assets.windmill2.rotation++;
        moveCloud(assets.cloud2, 1000, 900);
    }
    if (settings.roundsComplete>2) {
        assets.windmill3.rotation++;
        moveCloud(assets.cloud3, -400, 2000);
        if (assets.cloud3.x == -400){
            levelDone();
        }
    }
}

//Updates the text in the infocanvas. Has an if statement that is used to avoid NaN for sorted right when in the shop,
//and in start of every level.
function updateText(){
    settings.completeCalc = Math.floor((settings.correct/settings.itemsGone)*100);
    levelText.text = "Level: " + settings.level;
    if((!booleans.gameRunning && !booleans.binWarning || booleans.levelDone)){
        completeText.text = "Sorted Right: 0%";
    } else {
        completeText.text = "Sorted Right: " + settings.completeCalc + "%";
    }
    moneyText.text = settings.money + "$";
    checkPowerUp();
    infoCanvas.update();
}

//Enters and sets up the shop.
function enterShop (){
    shopMenu = new createjs.Container();
    shopScreen = new createjs.Bitmap(queue.getResult("shopScreen"));
    continueButton = new createjs.Bitmap(queue.getResult("continueButton"));
    continueButton.width = 445;
    continueButton.regX = continueButton.width/2;
    continueButton.x = stage.canvas.width/2;
    continueButton.y = 430;

    function createBuyButton(xValue, yValue, cost){
        b = new createjs.Bitmap(queue.getResult("buyButton"))
        b.width = 104;
        b.x = xValue;
        b.y = yValue;
        b.price = cost;
        return b;
    }
    phoneBuyButton=createBuyButton(280, 206, 50);
    medicineBuyButton=createBuyButton(600, 206, 80);
    physicsBuyButton=createBuyButton(280, 393, 100);
    shoesBuyButton=createBuyButton(600, 393, 70);

    phoneBuyButton.addEventListener('click', buyItemPhone);
    physicsBuyButton.addEventListener('click', buyItemPhysics);
    medicineBuyButton.addEventListener('click', buyItemMedicine);
    shoesBuyButton.addEventListener('click', buyItemShoes);

    function buyItemPhone(){
        if (settings.money >= phoneBuyButton.price && !powerup.phone){
            createjs.Sound.play("buyItem");
            swal({
                title: "Congratulations!",
                text: "You just bought a charge for your phone! Press C to call your grandma for help, and she will clean all the garbage for you! But " +
                "be aware, when grandma does the garbage you will not get any money!",
                confirmButtonText: "Accept",
                showConfirmButton: true,
                imageUrl: "img/phone.png"
            }, function () {
                powerup.phone=true;
                settings.money -= phoneBuyButton.price;
                updateText();
            });
        } else if (settings.money < phoneBuyButton.price && !powerup.phone) {
            createjs.Sound.play("message");
            swal({
                title: "Oh oh!",
                text: "You don't seem to have enough money to buy a phone charge, recycle more garbage to gain money!",
                confirmButtonColor: "#F00",
                confirmButtonText: "Accept",
                type: "error",
                showConfirmButton: true
            });
        } else {
            createjs.Sound.play("message");
            swal({
                title: "Woops",
                text: "You already have your phone fully charged. Use your battery on calling grandma if you want a refill!",
                confirmButtonText: "Accept",
                type: "warning",
                showConfirmButton: true
            });
        }
    }
    function buyItemPhysics(){
        if (settings.money >= physicsBuyButton.price && !powerup.defyPhysics){
            createjs.Sound.play("buyItem");
            swal({
                title: "Congratulations!",
                text: "You just bought Defy Physics! You can now exit the canvas on the left/right side and reappear on the opposite side!",
                confirmButtonText: "Accept",
                showConfirmButton: true,
                imageUrl: "img/physics.png"
            }, function () {
                powerup.defyPhysics=true;
                settings.money -= physicsBuyButton.price;
                updateText();

            });
        } else if (settings.money < physicsBuyButton.price && !powerup.defyPhysics) {
            createjs.Sound.play("message");
            swal({
                title: "Oh oh!",
                text: "You don't seem to have enough money to buy Defy Physics, recycle more garbage to gain money!",
                confirmButtonColor: "#F00",
                confirmButtonText: "Accept",
                type: "error",
                showConfirmButton: true
            });
        } else {
            createjs.Sound.play("message");
            swal({
                title: "Woops",
                text: "You already have this powerup!",
                confirmButtonText: "Accept",
                type: "warning",
                showConfirmButton: true
            });
        }
    }
    function buyItemMedicine(){
        if (settings.money > medicineBuyButton.price){
            createjs.Sound.play("buyItem");
            swal({
                title: "Congratulations!",
                text: "You just bought Medicine! The garbage will now have 3 seconds added to their life span!",
                confirmButtonText: "Accept",
                showConfirmButton: true,
                imageUrl: "img/medicine.png"
            }, function () {
                settings.money -= medicineBuyButton.price;
                powerup.medicine += 3;
                updateText();

            });
        } else if (settings.money < medicineBuyButton.price) {
            createjs.Sound.play("message");
            swal({
                title: "Oh oh!",
                text: "You don't seem to have enough money to buy Medicine, recycle more garbage to gain money!",
                confirmButtonColor: "#F00",
                confirmButtonText: "Accept",
                type: "error",
                showConfirmButton: true
            });
        }
    }
    function buyItemShoes(){
        if (settings.money >= shoesBuyButton.price){
            createjs.Sound.play("buyItem");
            swal({
                title: "Congratulations!",
                text: "You just bought new Shoes! +1 added to your run speed!",
                confirmButtonText: "Accept",
                showConfirmButton: true,
                imageUrl: "img/shoes.png"
            }, function () {
                settings.money -= shoesBuyButton.price;
                powerup.shoes += 1;
                assets.hero.speed+=powerup.shoes/4;
                updateText();
            });
        } else if (settings.money < medicineBuyButton.price) {
            createjs.Sound.play("message");
            swal({
                title: "Oh oh!",
                text: "You don't seem to have enough money to buy new Shoes, recycle more garbage to gain money!",
                confirmButtonColor: "#F00",
                confirmButtonText: "Accept",
                type: "error",
                showConfirmButton: true
            });
        }
    }
    shopMenu.addChild(shopScreen, continueButton, phoneBuyButton, medicineBuyButton, shoesBuyButton, physicsBuyButton);
    continueButton.addEventListener('click', levelIntro);
    stage.addChild(shopMenu);
    stage.update();
}

//Finishs a level when 3 rounds are done. Prints end level text if it's completed or not. Resets values for new level.
function levelDone () {
    createjs.Sound.stop("parkSound");
    booleans.gameRunning = false;
    booleans.levelDone=true;
    booleans.pickup=false;
    stage.removeAllChildren();
    infoCanvas.removeAllChildren();
    infoCanvas.addChild(moneyText, completeText, assetsText, levelText, physicsAsset, phoneAsset, medicineAsset, shoesAsset, settings.sound, settings.restart);
    infoCanvas.update();
    garbage = [];
    bin = [];
    settings.roundsComplete = -1;
    settings.itemsGone=0;
    settings.correct=0;

    assets.boss.x = stage.canvas.width - assets.boss.width/2;
    assets.boss.y = 0;
    assets.hero.x = 300;
    assets.hero.y = 500;
    assets.cloud1=createCloud(200, 10);
    assets.cloud2=createCloud(500, 20);
    assets.cloud3=createCloud(20, 20);
    assets.windmill1.rotation = 0;
    assets.windmill2.rotation = 0;
    assets.windmill3.rotation = 0;

    stage.addChild(assets.background, assets.sun, assets.cloud1, assets.cloud2, assets.cloud3, assets.windmill1,
        assets.windmill2, assets.windmill3);

    if (settings.completeCalc > settings.completeNeeded && settings.level < 4){
        if (settings.bossSpeed > 0) {
            settings.bossSpeed++;
        } else {
            settings.bossSpeed--;
        }
        createjs.Sound.play("winSound");
        swal({
            title: "Good job!",
            text: "You completed level " + settings.level + "!" ,
            type: "success",
            showConfirmButton: true
        }, function(){
            enterShop();
        });
        settings.level++;
        settings.amount = 3 + settings.level;
        settings.throwSpeed-=250;
        settings.completeNeeded += 6;
        updateText();
    } else if (settings.level >= 4 && settings.completeCalc > settings.completeNeeded){
        createjs.Sound.play("winGame");
        booleans.gameRunning = false;
        swal({
            title: "Congratulations!",
            text: "You have defeated Pollutus and recycled all the garbage, you are officially a recycling Master! Now go recycle in real life or " +
            "restart this game!",
            type: "success",
            showConfirmButton: true,
            confirmButtonText: "Restart Game"
        }, function () {
            restartGame();
            });
        } else {
        if (settings.level == 1) {
            settings.amount = 3;
        } else {
            settings.amount = 3 + settings.level;
        }
        createjs.Sound.play("loseSound");
        swal({
            title: "Darnit!",
            text: "You failed level " + settings.level + "! Try again or enter the shop to buy supplies.",
            type: "error",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Try Again",
            cancelButtonText: "Go to shop"

        },function(isConfirm){
            if (isConfirm) {
                startLevel();
                stage.update();
                infoCanvas.update();
                keepGoingBoss();
            } else {
                enterShop();
            }
        });
    }
}


function onTick(e){
    stage.update(e);
    if (booleans.gameRunning) {
        keepGoingBoss();
        if (!booleans.heroHit) {
            moveHero();
        }
        checkCollisions();
        windmillRotate();
        binText.y = assets.hero.y - 40;
        binText.x = assets.hero.x - 25;
    }
    if (booleans.gameRunning && garbage < settings.amount && booleans.stageMoved){
        if (!assets.grandma.active && !assets.grandma.init) {
            settings.roundsComplete++;
        }
        if (settings.roundsComplete < 3 && !assets.grandma.init){
            addGarbage();
        }
    }
}