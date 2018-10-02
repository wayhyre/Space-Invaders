function SpaceInvaders(canvas) {
  this.canvas = canvas;
  this.c = canvas.getContext("2d");
  this.canvas.focus();

  /*Properties*/
  this.game_over = false;
  this.paused = false;
  this.guide = false;
  this.muted = false;
  this.started = false;
  this.score = 0;
  this.level = 0;
  this.lives = 2;
  this.max_lives = 5;
  this.alien_speed = 20;
  this.ship_radius = 13;
  this.tank_currentx = (this.canvas.width - this.ship_radius) / 2;
  this.time_until_spaceship = Math.floor((Math.random() * 40) + 15);
  this.alien_count = 0;
  this.barrier_count = 4;
  this.next_level_timer = 3;

  this.rows = 5;
  this.columns = 11;

  /*Indicators*/
  this.health_label = new NumberLabel("LIVES: ", 16, this.canvas.height - 30, 0);
  this.level_label = new NumberLabel("LEVEL: ", this.canvas.width - 70, 16, 0);
  this.score_label = new NumberLabel("SCORE: ", 16, 16, 0);
  this.fps_label = new NumberLabel("FPS: ", this.canvas.width - 64, this.canvas.height - 30, 0);
  this.muted_label = new Label("SOUND MUTED!", this.canvas.width - 119, this.canvas.height - 46, 0);
  
  /*Credits Label*/
  var credit_text = "Created by David"
  var x = (canvas.width - this.c.measureText(credit_text).width) / 2;
  this.credits_label = new Label(credit_text, x - 20, this.canvas.height - 30, 0);

  /*Audio*/
  this.tank_shoot = new Audio("./assets/sounds/tank_shoot.wav");
  this.explosion = new Audio("./assets/sounds/explosion.wav");
  this.bg_music = new Audio("./assets/sounds/space-invaders.mp3");
  this.bg_music.loop = true;
  
  this.spawn_barriers();
  this.reset_game();
}

SpaceInvaders.prototype.end_game = function() {
	this.ship.alive = false;
	this.game_over = true;
	this.time_until_spaceship = Math.floor((Math.random() * 40) + 15);

  this.barriers.forEach(function(barrier, b, barriers) {
      barrier.hits = 0;
  }, this);
}

SpaceInvaders.prototype.spawn_barriers = function() {
  this.barriers = [];
  var y_height = 440;
  var starting_x = 110;
  var width = 14;

  for (left = 0; left < 4; left++) {
    this.barriers.push(new BarrierLeft(starting_x + (0 * width), y_height));
    this.barriers.push(new BarrierMiddle(starting_x + (1 * width), y_height));
    this.barriers.push(new BarrierRight(starting_x + (2 * width), y_height));
    starting_x += 125;
  }
}

SpaceInvaders.prototype.reset_game = function() {
  this.alive = true;
  this.game_over = false;
  this.level += 1;

  this.ship = new Ship(this.tank_currentx, 500, 200, this.ship_radius);

  if (this.lives < this.max_lives) {
	this.lives += 1;
  }

  if (this.alien_speed < 120) {
	  this.alien_speed += 1;
  }

  this.projectiles = [];
  this.aliens = [];
  this.spaceships = [];

  for (var i = 0; i < this.rows; i++) {
	  for (var j = 0; j < this.columns; j++) {

		  var type = 0;
		  var space_x = 0;
		  var space_y = 0;
		  var space_length = 35;

		  if (i == 0) {
			  type = 0;
			  space_x = j * space_length;
			  space_y = i * space_length;
		  }
		  else if (i == 1 || i == 2) {
			  type = 1;
			  space_x = j * space_length - 3;
			  space_y = i * space_length;
		  }
		  else {
			  type = 2;
			  space_x = j * space_length - 4;
			  space_y = i * space_length;
		  }

		  space_x += this.canvas.width / 5;
		  space_y += this.canvas.height / 8;

		  var myAlien = new Alien(space_x, space_y, type, this.alien_speed)

		  if (i == 4) {
			  myAlien.can_shoot = true;
		  }

		  this.aliens.push(myAlien);
	  }
  }

  this.alien_count = this.aliens.length;
}

SpaceInvaders.prototype.draw = function(fps) {
  this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.c.save();
  this.c.fillStyle = "#FFFFFF";
  this.score_label.draw(this.c, this.score);
  this.fps_label.draw(this.c, fps);
  this.health_label.draw(this.c, this.lives);
  this.level_label.draw(this.c, this.level);
  this.credits_label.draw(this.c);
  
  if (this.muted) {
	this.muted_label.draw(this.c);
  }
  
  this.c.restore();

  this.c.save();
  this.c.beginPath();
  this.c.strokeStyle = "#00FF00";
  this.c.moveTo(14, 540);
  this.c.lineTo(614, 540);
  this.c.stroke();
  this.c.restore();

  this.ship.draw(this.c);

  if (this.guide) {
	draw_grid(this.c);
  }

  this.barriers.forEach(function(barrier, b, barriers) {
    barrier.draw(this.c);
  }, this);
  
  if(!this.started) {
    centre_text(this.c, "Space Invaders", 150, 28);
    centre_text(this.c, "Press space to start!", 180, 18);
	centre_text(this.c, "M: Mute", 240, 14);
	centre_text(this.c, "P: Pause", 270, 14);
	centre_text(this.c, "Space: Shoot", 300, 14);
	centre_text(this.c, "Left: Move Left", 330, 14);
	centre_text(this.c, "Right: Move Right", 360, 14);
    return;
  }
  
  if(this.game_over) {
    centre_text(this.c, "GAME OVER", 150, 28);
    centre_text(this.c, "Press space to play again", 180, 18);
    return;
  }

  if (this.paused) {
	centre_text(this.c, "Paused", 150, 28);
	centre_text(this.c, "Press 'P' to play again", 180, 18);
    return;
  }

  if (this.next_level_timer > 0) {
    centre_text(this.c, "Level starting in... " + Math.floor(this.next_level_timer), 150, 28);
    centre_text(this.c, "Get Ready!", 180, 18);
    return;
  }

  this.aliens.forEach(function(alien, i, aliens) {
	  if (alien != 0) {
		alien.draw(this.c);
	  }
  }, this);

  this.spaceships.forEach(function(spaceship, i, spaceships) {
	  spaceship.draw(this.c);
  }, this);

  this.projectiles.forEach(function(p) {
    p.draw(this.c, this.guide);
  }, this);

}

SpaceInvaders.prototype.update = function(elapsed) {
	
	/* Check for Game Mute */
	if (this.muted || !this.started)
	{
		this.bg_music.volume = 0;
		this.tank_shoot.volume = 0;
		this.explosion.volume = 0;
		this.bg_music.pause();
	}
	else {
		this.bg_music.volume = 0.5;
		this.tank_shoot.volume = 0.4;
		this.explosion.volume = 0.3;
		this.bg_music.play();
	}
	
	/* Check for Game Pause */
	if(this.paused || this.game_over || !this.started) {
		return;
	}

	/* Check Time Until Next Level Loaded */
	if (this.next_level_timer > 0) {
		this.next_level_timer -= elapsed;
		return;
	}

	/* Check if all Aliens destroyed */
	if (this.alien_count == 0) {
		this.tank_currentx = this.ship.x_coord;
		this.reset_game();
		this.next_level_timer = 3;
	}
	
	/* Update Ship */
	this.ship.update(elapsed, this.c);

	/* Check if Ship is Alive */
	if (this.ship.alive == false) {
		this.ship.time_dead += elapsed;
		if (this.ship.time_dead > 0.5) {
			this.ship.alive = true;
		}
	}

	/* Check to see if ship is shooting */
	if(this.ship.trigger && this.ship.time_until_reloaded == 0) {
		this.tank_shoot.play();
		this.projectiles.push(this.ship.projectile(elapsed));
	}

	/* Handle Red Spaceship */
	this.time_until_spaceship -= elapsed;

	if (this.time_until_spaceship <= 0) {
		var space_x = 0;
		var direction = 1;

		this.time_until_spaceship = Math.floor((Math.random() * 40) + 15);

		if (this.time_until_spaceship > 38) {
			space_x = this.c.canvas.width;
			direction = -1;
		}
		else {
			space_x = -48;
			direction = 1;
		}

		if (this.spaceships.length < 1) {
			this.spaceships.push(new SpaceShip(space_x, 40, 150, direction));

		}
		else {
			this.spaceships.splice(0, 1);
			this.time_until_spaceship = 1;
		}
	}
	
	/* Update Red Spaceship */
	this.spaceships.forEach(function(spaceship, i, spaceships) {
		if (spaceship.alive == false) {
			spaceship.time_dead += elapsed;
		}

		if (spaceship.alive == false && spaceship.time_dead > 0.1) {
			spaceships.splice(i, 1);
		}
		spaceship.update(elapsed, this.c);
	}, this);

	/* Update each aliens position seperately to prevnt elapsed time issues */
	this.aliens.forEach(function(alien, i, aliens) {
		if (alien != 0) {
			if (alien.x_coord - 24 < 0 || alien.x_coord + 48 > this.c.canvas.width) {
				if (aliens[i].y_coord < 475) {
					this.aliens.forEach(function(alien2, i2, aliens2) {
						alien2.y_coord += 10;
						alien2.speed += alien2.speed_increase;
						if (alien.x_coord - 24 < 0) {
							alien2.alien_dir = 1;
						}
						else {
							alien2.alien_dir = -1;
						}
					}, this);
				}
				else {
					this.end_game();
				}
			}
		}
	}, this);
	
	/* Handle Each Alien */
	this.aliens.forEach(function(alien, i, aliens) {
		/* Handle alien shooting */
		if (alien.can_shoot == true) {
			alien.time_until_shoot -= elapsed;

			if (alien.time_until_shoot <= 0) {
				this.tank_shoot.play();
				this.projectiles.push(alien.projectile(elapsed));
				alien.time_until_shoot = Math.floor((Math.random() * 12) + 7);
			}
		}

		/* Handle alien death */
		if (alien.state == 2) {
			alien.time_dead += elapsed;
		}

		if (alien.state == 2 && alien.time_dead > 0.2) {
			aliens[i] = 0;
			this.alien_count--;

			for (a = 0; a <= this.rows; a++) {
				front = i;
				for (b = 0; b <= this.rows-1; b++) {
					front += this.columns;
					if (front < aliens.length - 1) {
						if (aliens[front] != 0) {
							aliens[front].can_shoot == true
							found = true;
						}
					}
				}

				back = i;
				for (c = 0; c <= this.rows-1; c++) {
					back -= this.columns;
					if (back >= 0) {
						if (aliens[back] != 0) {
							aliens[back].can_shoot = true;
							break;
						}
					}
				}
			}
		}

		/* Update current alien */
		if (alien != 0) {
			alien.update(elapsed, this.c);
		}
	}, this);

	/* Update and check each projectile */
	this.projectiles.forEach(function(p, i, projectiles) {
		p.update(elapsed, this.c);
		
		if(p.y_coord <= 20) {
			projectiles.splice(i, 1);
		}
		else {
			
			/* Check Ship Collision */
			if (collision(p, this.ship) && this.ship.alive == true) {
				if (p.tank_bullet == false) {
					this.explosion.play();
					projectiles.splice(i, 1);
					this.ship.alive = false;
					this.lives--;
					
					if (this.lives <= 0) {	
						this.end_game();
					}
				}
			}
			
			/* Check Alien Collision */
			this.aliens.forEach(function(alien, j, aliens) {
				if(collision(alien, p) && p.tank_bullet == true && alien != 0 && alien.state < 2) {
					this.explosion.play();
					projectiles.splice(i, 1);
					alien.state = 2;
					this.ship.time_until_reloaded = 0;

					switch(alien.type)
					{
						case 0:
						this.score += 40;
						break;
						case 1:
						this.score += 20;
						break;
						case 2:
						this.score += 10;
						break;
					}
				}
			}, this);

			/* Check Barrier Collision */
			this.barriers.forEach(function(barrier, b, barriers) {
				if(collision(barrier, p) && barrier.hits < 7) {
					this.explosion.play();
					projectiles.splice(i, 1);
					if (p.tank_bullet) {
						this.ship.time_until_reloaded = 0;
					}
					barrier.hits += 1;
				}
			}, this);
			
			/* Check Red Spaceship Collision */
			this.spaceships.forEach(function(spaceship, s, spaceships) {
				if(collision(spaceship, p)) {
					this.explosion.play();
					projectiles.splice(i, 1);
					spaceship.alive = false;
					this.score += Math.floor((Math.random() * 500) + 10);
				}
			}, this);
		}
	}, this);
}

SpaceInvaders.prototype.frame = function(timestamp) {
  if (!this.previous) this.previous = timestamp;
  var elapsed = timestamp - this.previous;
  this.update(elapsed / 1000);
  this.draw(1000 / elapsed);
  this.previous = timestamp;
}

SpaceInvaders.prototype.key_handler = function(e, value) {
  var nothing_handled = false;

  switch(e.keyCode) {
    case 37: // left arrow
    this.ship.left_thruster = value;
    break;

    case 39: // right arrow
    this.ship.right_thruster = value;
    break;

    case 32: //spacebar
    if(this.game_over) {
		this.score = 0;
	    this.level = 0;
	    this.lives = 2;
	    this.reset_game();
	}
	else if (!this.started)
	{
		this.started = true;
	}
    else
	{
      this.ship.trigger = value;
	}
    break;

    case 71: // g for guide
	if(value) this.guide = !this.guide;
    break;

	case 80: //p for pause
	if(value) {
		if (!this.game_over && this.started) {
			this.paused = !this.paused;
			this.muted = !this.muted;
		}
	}
    break;

	case 77: //m for mute
	if(value) this.muted = !this.muted;
    break;

    default:
	//console.log("Key: " + e.key + " Code: " +e.keyCode);
    nothing_handled = true;
	break;
  }
  
  if(!nothing_handled) e.preventDefault();
}
