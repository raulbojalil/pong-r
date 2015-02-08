(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                   || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());


var getDate = function () {
    var d = new Date();
    var day = "" + d.getDate(); if (day.length == 1) day = "0" + day;
    var month = "" + (d.getMonth() + 1); if (month.length == 1) month = "0" + month;
    var year = d.getFullYear();
    var hour = d.getHours(); if (hour.length == 1) hour = "0" + hour;
    var minutes = d.getMinutes(); if (minutes.length == 1) minutes = "0" + minutes;

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes;
};


var Input = { Up: false, Down: false };
$(document).keydown(function (e) {
    if (e.which == 38) Input.Up = true;
    else if (e.which == 40) Input.Down = true;

    return false;
});

$(document).keyup(function (e) {
    if (e.which == 38) Input.Up = false;
    else if (e.which == 40) Input.Down = false;

    return false;
});

var Pong = {

    SCREEN_WIDTH: 600,
    SCREEN_HEIGHT: 400,
    ball: null,
    player1: null,
    player2: null,
    player: null,
    cpuplayer: null,
    lastPlayer1Score: 0,
    player1Score: 0,
    lastPlayer2Score: 0,
    player2Score: 0,
    ctx: null,
    timer: 0,
    ballSpeeds: [0.3,-0.3],

    Paddle: function(x, y){

        var _pos = {
            x: x,
            y: y
        };

        var _size = {
            w: 16,
            h: 64
        };

        var _speed = {
            x: 0,
            y: 0.25
        };

        this.moveUp = function (time) {
            _pos.y -= _speed.y * time;
        };

        this.moveDown = function (time) {
            _pos.y += _speed.y * time;
        };

        this.setPos = function (x, y) {
            _pos.x = x;
            _pos.y = y;
        };

        this.setPosY = function (val) {
            _pos.y = val;
        };

        this.getPosX = function () {
            return _pos.x;
        };

        this.getPosY = function () {
            return _pos.y;
        };


        this.getWidth = function () {
            return _size.w;
        };

        this.getHeight = function () {
            return _size.h;
        };

        this.draw = function (ctx) {

            ctx.fillStyle = "white";
            ctx.fillRect(_pos.x, _pos.y, _size.w, _size.h);
        };

    },

    Ball: function(x, y)
    {
        var _pos = {
            x: x,
            y: y
        };

        var _size = {
            w: 16,
            h: 16
        };

        var _speed = {
            x: 0,
            y: 0
        };
        
        this.setSpeedX = function (val) {
            _speed.x = val;
        };

        this.setSpeedY = function (val) {
            _speed.y = val;
        };

        this.getSpeedX = function () {
            return _speed.x;
        };

        this.getSpeedY = function () {
            return _speed.y;
        };

        this.getWidth = function(){
            return _size.w;
        };

        this.getHeight = function(){
            return _size.h;
        };

        this.getPosX = function()
        {
            return _pos.x;
        };

        this.getPosY = function()
        {
            return _pos.y;
        };

        this.setPos = function(x, y) {
            _pos.x = x;
            _pos.y = y;
        };

        this.move = function (time) {
            _pos.x += _speed.x * time;
            _pos.y += _speed.y * time;
        };

        this.invertSpeedX = function () {
            _speed.x = -_speed.x;
        };

        this.invertSpeedY = function () {
            _speed.y = -_speed.y;
        };

        this.draw = function (ctx) {
           
            ctx.fillStyle = "white";
            ctx.fillRect(_pos.x, _pos.y, _size.w, _size.h);
        };
    },

    init: function (container, right, playVsCpu) {
        
        var canvas = $('<canvas style="margin-left: auto; margin-right: auto; display: block;" width="' + this.SCREEN_WIDTH + '" height=' + this.SCREEN_HEIGHT + '></canvas>');
        $(container).empty().append(canvas);
        this.ctx = canvas[0].getContext('2d');
        this.player1Score = 0;
        this.player2Score = 0;
        this.lastPlayer1Score = 0;
        this.lastPlayer2Score = 0;
        this.player1 = new this.Paddle(0,0);
        this.player2 = new this.Paddle(0, 0);

        this.player = right ? this.player2 : this.player1;
        
        if (playVsCpu)
            this.cpuplayer = right ? this.player1 : this.player2;

        this.ball = new this.Ball(0,0);
        this.reset();
    },

    draw: function () {

        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

        this.ball.draw(this.ctx);
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.player1Score + " - " + this.player2Score, (this.SCREEN_WIDTH/2) - 15, 30);
    },

    reset: function(){

        this.ball.setPos(this.SCREEN_WIDTH / 2 - this.ball.getWidth() / 2,
                         this.SCREEN_HEIGHT / 2 - this.ball.getHeight() / 2);

        this.ball.setSpeedX(this.ballSpeeds[Math.round(Math.random() * 1)]);
        this.ball.setSpeedY(this.ballSpeeds[Math.round(Math.random() * 1)]);

        this.player1.setPos(8, this.SCREEN_HEIGHT / 2 - this.player1.getHeight() / 2);
        this.player2.setPos(this.SCREEN_WIDTH - this.player2.getWidth() - 8, this.SCREEN_HEIGHT / 2 - this.player2.getHeight() / 2);

        timer = 500;
    },

    handleBallWallCollisions: function(){

        if ((this.ball.getSpeedX() > 0 && (this.ball.getPosX() + this.ball.getWidth()) > this.SCREEN_WIDTH) || (this.ball.getSpeedX() < 0 && this.ball.getPosX() < 0)) {
            if (this.ball.getPosX() < 0) this.player2Score++; else this.player1Score++;
            this.reset();
        }
        else if ((this.ball.getSpeedY() > 0 && (this.ball.getPosY() + this.ball.getHeight()) > this.SCREEN_HEIGHT) || (this.ball.getSpeedY() < 0 && this.ball.getPosY() < 0))
            this.ball.invertSpeedY();
    },

    handleBallPaddleCollision: function(paddle){

        if ((this.ball.getSpeedX() < 0 && (this.ball.getPosY() + this.ball.getHeight() > paddle.getPosY()) && (this.ball.getPosY() < paddle.getPosY() + paddle.getHeight()) && paddle.getPosX() < this.ball.getPosX() && (this.ball.getPosX() - paddle.getPosX() < paddle.getWidth())) ||
            (this.ball.getSpeedX() > 0 && (this.ball.getPosY() + this.ball.getHeight() > paddle.getPosY()) && (this.ball.getPosY() < paddle.getPosY() + paddle.getHeight()) && paddle.getPosX() > this.ball.getPosX() && (paddle.getPosX() - this.ball.getPosX() < paddle.getWidth())))
            this.ball.invertSpeedX();
    },

    handlePaddleWallCollision: function(paddle)
    {
        if (paddle.getPosY() < 0)
            paddle.setPosY(0);
        else if (paddle.getPosY() + paddle.getHeight() > this.SCREEN_HEIGHT)
            paddle.setPosY(this.SCREEN_HEIGHT - paddle.getHeight());
    },

    handleInput: function(time)
    {
        if (Input.Up && this.player.getPosY() > 0)
            this.player.moveUp(time);
        else if (Input.Down)
            this.player.moveDown(time);

        this.handlePaddleWallCollision(this.player);
    },

    update: function (time) {

        if (timer <= 0) {
            this.ball.move(time);
            this.handleBallWallCollisions();
            this.handleBallPaddleCollision(this.player1);
            this.handleBallPaddleCollision(this.player2);
        }
        else
            timer -= time;

    },

    updateCPUPlayer: function(time) {

        if (this.ball.getPosY() < this.cpuplayer.getPosY())
            this.cpuplayer.moveUp(time);
        else if (this.ball.getPosY() > this.cpuplayer.getPosY())
            this.cpuplayer.moveDown(time);

        this.handlePaddleWallCollision(this.cpuplayer);
    },

    updateFromServer: function (ptype, packet) {


        if (packet.indexOf(",") != -1) {
            packet = packet.split(',');
            //this.ball.setPos(30.000550056, 30.066999001);
            if (ptype > 0) //El host controla la bola
            {
                this.ball.setPos(parseInt(packet[0]), parseInt(packet[1]));
                this.player1.setPosY(parseInt(packet[2]));

                if (packet.length > 3) {
                    this.player1Score = parseInt(packet[3]);
                    this.player2Score = parseInt(packet[4]);
                    this.player2.setPosY(parseInt(packet[5]));
                }
            }
        }
        else if(ptype != 1)
            this.player2.setPosY(parseInt(packet));
        
    }
};


var rafId = null;
var ptype = -1;
var host = "";
var guest = "";
var lastTime = 0;
var connection = $.connection('/pong');
var alt = false;

connection.received(function (data) {

   
    if (data[0] == "{") { //mensaje de control

        data = JSON.parse(data);
        
        //alt = !alt;
        alt = true;

        $("#messages li").each(function () { $(this).removeClass("alt"); });

        if (data.lastConnected)
            $("#messages").prepend('<li ' + (alt ? 'class="alt"' : '') + '>' + getDate() + ' - Se ha conectado ' + data.lastConnected + (data.lastConnectedType > 1 ? " (ESPECTADOR)" : " (JUGADOR)") + "</li>");
        else if (data.lastDisconnected)
            $("#messages").prepend('<li ' + (alt ? 'class="alt"' : '') + '>' + getDate() + ' - Se ha desconectado ' + data.lastDisconnected + "</li>");

        if (ptype != data.ptype || host != data.host || guest != data.guest) {

            ptype = data.ptype;
            host = data.host;
            guest = data.guest;

            if (rafId)
                cancelAnimationFrame(rafId);

            Pong.init("#game", ptype, !guest);

            $("#game").prepend('<div><span ' + (ptype == 0 ? 'style="font-weight: bold"' : "") + '>' +
                host + '</span> vs. <span ' + (ptype == 1 ? 'style="font-weight: bold"' : "") + '>' +
                (guest ? guest : "CPU (esperando a jugador...)") + '</span>' + (ptype > 1 ? "<span> (Espectando)</span>" : "") + '</div>');

            lastTime = 0;
            animate(0);
        }
    }
    else //packet del juego
        Pong.updateFromServer(ptype, data);
    
});

connection.start().done(function (e) {

    while (!(host = prompt("Por favor introduce tu nombre de jugador"))) { }
    connection.send("_" + host);

});


function animate(time) {

    rafId = requestAnimationFrame(animate);

    var timeElapsed = Math.min(time - lastTime, 50);
    if (!guest)
        Pong.updateCPUPlayer(timeElapsed);

    if (ptype == 0) { //HOST
        Pong.update(timeElapsed);
        Pong.handleInput(timeElapsed);

        if (guest) {
            var packet = [Pong.ball.getPosX(), Pong.ball.getPosY(), Pong.player1.getPosY()];

            if (Pong.player1Score != Pong.lastPlayer1Score || Pong.player2Score != Pong.lastPlayer2Score) {
                packet.push(Pong.player1Score);
                packet.push(Pong.player2Score);
                packet.push(Pong.player2.getPosY());
            }

            Pong.lastPlayer1Score = Pong.player1Score;
            Pong.lastPlayer2Score = Pong.player2Score;

            connection.send(packet.join(","));
        }
    }
    else if (ptype == 1)
    {
        Pong.handleInput(timeElapsed);
        connection.send(Pong.player2.getPosY());
    }

    Pong.draw();
    lastTime = time;
}




