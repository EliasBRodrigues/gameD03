Spacedots = new function(){
  
    let isMobile =  (navigator.userAgent.toLowerCase().indexOf('android') != -1) || 
                    (navigator.userAgent.toLowerCase().indexOf('iphone') != -1);
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    let canvas;
    let context;
    let status;
    let message;
    let title;
    let startButton;
    let enemies = [];
    let boosts = [];
    let particles = [];
    let player;
    let mouseX = (window.innerWidth - screenWidth);
    let mouseY = (window.innerHeight - screenHeight);
    let playing = false;
    let score = 0;
    let time = 0;
    let velocity = { x: -1.5, y: 1 };
    let difficulty = 1;
    
    this.init = function(){
    
      canvas = document.getElementById('world');
      status = document.getElementById('status');
      message = document.getElementById('message');
      title = document.getElementById('title');
      startButton = document.getElementById('startButton');
      
      if (canvas && canvas.getContext) {
        context = canvas.getContext('2d');
        
        
        document.addEventListener('mousemove', documentMouseMoveHandler, false);
        document.addEventListener('mousedown', documentMouseDownHandler, false);
        document.addEventListener('mouseup', documentMouseUpHandler, false);
        canvas.addEventListener('touchstart', documentTouchStartHandler, false);
        document.addEventListener('touchmove', documentTouchMoveHandler, false);
        document.addEventListener('touchend', documentTouchEndHandler, false);
        window.addEventListener('resize', windowResizeHandler, false);
        startButton.addEventListener('click', startButtonClickHandler, false);
        
        player = new Player();
        
        windowResizeHandler();
        
        setInterval(loop, 1000 / 70);
      }
    };
    
    function startButtonClickHandler(event){
      event.preventDefault();
      
      if( playing == false ) {
        playing = true;
        
        enemies = [];
        boosts = [];
        score = 0;
        difficulty = 1;
        
        player.trail = [];
        player.position.x = mouseX;
        player.position.y = mouseY;
        player.boost = 0;
        
        message.style.display = 'none';
        status.style.display = 'block';
        
        time = new Date().getTime();
      }
    }
    
    function gameOver() {
      playing = false;
      
      message.style.display = 'block';
      
      title.innerHTML = 'Ixi, perdeu! Só lamento. (' + Math.round( score ) + ' pontos)';
    }
    
    function documentMouseMoveHandler(event){
      mouseX = event.clientX - (window.innerWidth - screenWidth) * .5 - 10;
      mouseY = event.clientY - (window.innerHeight - screenHeight) * .5 - 10;
    }
    
    function documentMouseDownHandler(event){
      mouseIsDown = true;
    }
    
    function documentMouseUpHandler(event) {
      mouseIsDown = false;
    }
    
    function documentTouchStartHandler(event) {
      if(event.touches.length == 1) {
        event.preventDefault();
        
        mouseX = event.touches[0].pageX - (window.innerWidth - screenWidth) * .5;
        mouseY = event.touches[0].pageY - (window.innerHeight - screenHeight) * .5;
        
        mouseIsDown = true;
      }
    }
    
    function documentTouchMoveHandler(event) {
      if(event.touches.length == 1) {
        event.preventDefault();
  
        mouseX = event.touches[0].pageX - (window.innerWidth - screenWidth) * .5;
        mouseY = event.touches[0].pageY - (window.innerHeight - screenHeight) * .5;
      }
    }
    
    function documentTouchEndHandler(event) {
      mouseIsDown = false;
    }
    
    function windowResizeHandler() {
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;
      
      canvas.width = screenWidth;
      canvas.height = screenHeight;
      
      var cvx = (window.innerWidth - screenWidth) * .5;
      var cvy = (window.innerHeight - screenHeight) * .5;
      
      canvas.style.position = 'absolute';
      canvas.style.left = cvx + 'px';
      canvas.style.top = cvy + 'px';
      
      message.style.left = cvx + 'px';
      message.style.top = cvy + 200 + 'px';
    }
    
    function createParticles( position, spread, color ) {
      var q = 10 + ( Math.random() * 15 );
      
      while( --q >= 0 ) {
        var p = new Particle();
        p.position.x = position.x + ( Math.sin(q) * spread );
        p.position.y = position.y + ( Math.cos(q) * spread );
        p.velocity = { x: -4 + Math.random() * 8, y: - 4 + Math.random() * 8 };
        p.alpha = 1;
        
        particles.push( p );
      }
    }
  
    function loop() {
      
      context.clearRect(0,0,canvas.width,canvas.height);
      
      var svelocity = { x: velocity.x * difficulty, y: velocity.y * difficulty };
      
      var i, j, ilen, jlen;
      
      if( playing ) {
        difficulty += 0.0008;
        
        pp = player.clonePosition();
        
        player.position.x += ( mouseX - player.position.x ) * 0.13;
        player.position.y += ( mouseY - player.position.y ) * 0.13;
        
        score += 0.4 * difficulty;
        score += player.distanceTo( pp ) * 0.1;
        
        player.boost = Math.max( player.boost - 1, 0 );
        
        if( player.boost > 0 && ( player.boost > 100 || player.boost % 3 != 0 ) ) {
          context.beginPath();
          context.fillStyle = '#167a66';
          context.strokeStyle = 'yellow';
          context.arc(player.position.x, player.position.y, player.size*2, 0, Math.PI*2, true);
          context.fill();
          context.stroke();
        }
        
        player.trail.push( new Point( player.position.x, player.position.y ) );
        
        context.beginPath();
        context.strokeStyle = 'gold';
        context.lineWidth = 2;
        
        for( i = 0, ilen = player.trail.length; i < ilen; i++ ) {
          p = player.trail[i];
          
          context.lineTo( p.position.x, p.position.y );
          
          p.position.x += svelocity.x;
          p.position.y += svelocity.y;
        }
        
        context.stroke();
        context.closePath();
        
        if( player.trail.length > 60 ) {
          player.trail.shift();
        }
        
        context.beginPath();
        context.fillStyle = 'orange';
        context.arc(player.position.x, player.position.y, player.size/2, 0, Math.PI*2, true);
        context.fill();
      }
      
      if( playing && ( player.position.x < 0 || player.position.x > screenWidth || player.position.y < 0 || player.position.y > screenHeight ) ) {
        gameOver();
      }
      
      for( i = 0; i < enemies.length; i++ ) {
        p = enemies[i];
        
        if( playing ) {
          if( player.boost > 0 && p.distanceTo( player.position ) < ( ( player.size * 4 ) + p.size ) * 0.5 ) {
            createParticles( p.position, 10 );
            enemies.splice( i, 1 );
            i --;
            score += 10;
            continue;
          }
          else if( p.distanceTo( player.position ) < ( player.size + p.size ) * 0.5 ) {
            createParticles( player.position, 10 );
            gameOver();
          }
        }
        
        context.beginPath();
        context.fillStyle = 'red';
        context.arc(p.position.x, p.position.y, p.size/2, 0, Math.PI*2, true);
        context.fill();
        
        p.position.x += svelocity.x * p.force;
        p.position.y += svelocity.y * p.force;
        
        if( p.position.x < 0 || p.position.y > screenHeight ) {
          enemies.splice( i, 1 );
          i --;
        }
      }
      
      for( i = 0; i < boosts.length; i++ ) {
        p = boosts[i];
        
        if( p.distanceTo( player.position ) < ( player.size + p.size ) * 0.5 && playing ) {
          player.boost = 300;
          
          for( j = 0; j < enemies.length; j++ ) {
            e = enemies[j];
            
            if( e.distanceTo( p.position ) < 100 ) {
              createParticles( e.position, 10 );
              enemies.splice( j, 1 );
              j--;
              score += 10;
            }
          }
        }
        
        context.beginPath();
        context.fillStyle = '#00ffcc';
        context.arc(p.position.x, p.position.y, p.size/2, 0, Math.PI*2, true);
        context.fill();
        
        p.position.x += svelocity.x * p.force;
        p.position.y += svelocity.y * p.force;
        
        if( p.position.x < 0 || p.position.y > screenHeight || player.boost != 0 ) {
          boosts.splice( i, 1 );
          i --;
        }
      }
      
      if( enemies.length < 25 * difficulty ) {
        enemies.push( positionNewOrganism( new Enemy() ) );
      }
      
      if( boosts.length < 1 && Math.random() > 0.997 && player.boost == 0 ) {
        boosts.push( positionNewOrganism( new Boost() ) );
      }
      
      for( i = 0; i < particles.length; i++ ) {
        p = particles[i];
        
        p.velocity.x += ( svelocity.x - p.velocity.x ) * 0.04;
        p.velocity.y += ( svelocity.y - p.velocity.y ) * 0.04;
        
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        
        p.alpha -= 0.02;
        
        context.fillStyle = 'red'+Math.max(p.alpha,0)+')';
        context.fillRect( p.position.x, p.position.y, 1, 1 );
        
        if( p.alpha <= 0 ) {
          particles.splice( i, 1 );
        }
      }
      
      if( playing ) {
        scoreText = 'Pontos: <span>' + Math.round( score ) + '</span>';
        scoreText += ' Tempo: <span>' + Math.round( ( ( new Date().getTime() - time ) / 1000 ) * 100 ) / 100 + 's</span>';
        status.innerHTML = scoreText;
      }
    }
    
    function positionNewOrganism( p ) {
      if( Math.random() > 0.5 ) {
        p.position.x = Math.random() * screenWidth;
        p.position.y = -20;
      }
      else {
        p.position.x = screenWidth + 60;
        p.position.y = (-screenHeight * 0.2) + ( Math.random() * screenHeight * 1.2 );
      } 
      return p;
    }
  };


  function Point( x, y ) {
    this.position = { x: x, y: y };
  }
  Point.prototype.distanceTo = function(p) {
    var dx = p.x-this.position.x;
    var dy = p.y-this.position.y;
    return Math.sqrt(dx*dx + dy*dy);
  };
  Point.prototype.clonePosition = function() {
    return { x: this.position.x, y: this.position.y };
  };
  

  function Player() {
    this.position = { x: 0, y: 0 };
    this.trail = [];
    this.size = 8;
    this.boost = 0;
  }

  Player.prototype = new Point();
  

  function Enemy() {
    this.position = { x: 0, y: 0 };
    this.size = 6 + ( Math.random() * 4 );
    this.force = 1 + ( Math.random() * 0.4 );
  }

  Enemy.prototype = new Point();

  function Boost() {
    this.position = { x: 0, y: 0 };
    this.size = 10 + ( Math.random() * 8 );
    this.force = 1 + ( Math.random() * 0.4 );
  }

  Boost.prototype = new Point();

  function Particle() {
    this.position = { x: 0, y: 0 };
    this.force = 1 + ( Math.random() * 0.4 );
    this.color = '#ff0000';
  }
  
  Particle.prototype = new Point();
  
  Spacedots.init();