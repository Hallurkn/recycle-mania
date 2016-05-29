/**
 * Created by Hallur on 29-05-2016.
 */
var stage, hero;
var queue, preloadText;

function preload(){
    stage = new createjs.Stage("canvas");
    preloadText = new createjs.Text("0%", "30px monospace", "#FFF");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', loading);
    queue.on('complete', startGame);

    queue.loadManifest([
    ])
}

function loading (e){
    console.log(e.progress);
    preloadText.text = Math.round(e.progress*100) + "%";
    stage.update();
}

function startGame(){
    
}