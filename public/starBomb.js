var config = { 
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var score = 0;
var scoreText;
var bombs;
var musicConfig;
var musica;

var game = new Phaser.Game(config);

function preload () // Funcção para adicionar arquivos para o game
{
    this.load.image('sky', '../img/sky.png');
    this.load.image('ground', '../img/ground.png');
    this.load.image('star', '../img/star.png');
    this.load.image('bomb', '../img/bomb.png');

    this.load.spritesheet('dude', '../img/dude.png', { frameWidth: 32, frameHeight: 48 });
    
    this.load.audio('musica', ['../audio/fase.mp3', '../audio/fase.ogg']);
    this.load.audio('coin', ['../audio/star.mp3', '../audio/star.ogg']);
    this.load.audio('jump', ['../audio/jump.mp3', '../audio/Jump.ogg']);
    this.load.audio('dead', ['../audio/dead.mp3', '../audio/dead.ogg']);
}

function create () // Criação dos objetos e variaveis
{
    this.add.image(400, 300, 'sky');  //Adiciona o ceu

    platforms = this.physics.add.staticGroup(); // cria plataforma de forma estatica
    
    // Criação dos terrenos
    platforms.create(400, 568, 'ground').setScale(2).refreshBody(); 
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Criação e configuração do personagem
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, platforms); //Cria a colisão entre o personagem e o "chão"
    
    // Criação dos audios
    this.faseSound = this.sound.add('musica');
    this.starColect = this.sound.add('coin');
    this.jumpSound = this.sound.add('jump');
    this.deadSound = this.sound.add('dead');
    
    var musicConfig = { // Configurações de algum audio
        
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0
    };
    
    this.faseSound.play(musicConfig);
    

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    });

    stars.children.iterate(function (child){ // Criação das estrelas, colisões e coletagem e cpmtagem de pontos
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    function collectStar (player, star) {
        star.disableBody(true, true);

        
        this.starColect.play(); //Toca a musica

        score +=10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb'); // Criação das bombas
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between( -200 ,200 ), 20);
        }
    }

    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill:'#FFFF00'});

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    function hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.faseSound.stop();
        this.deadSound.play();
        gameOver = true;
    }



}

function update () // atualizações e controles
{
    if (cursors.left.isDown)
        {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
            this.jumpSound.play();
        }
}