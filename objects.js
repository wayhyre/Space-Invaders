function extend(ChildClass, ParentClass) {
  var parent = new ParentClass();
  ChildClass.prototype = parent;
  ChildClass.prototype.super = parent.constructor;
  ChildClass.prototype.constructor = ChildClass;
}

function collision(obj1, obj2) {
  return distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
}

function distance_between(obj1, obj2) {
  return Math.sqrt(Math.pow(obj1.x_coord - obj2.x_coord, 2) + Math.pow(obj1.y_coord - obj2.y_coord, 2));
}

/*Mass Object - Because everything has mass*/
function Mass(radius, x, y, x_speed, y_speed) {
  this.radius = radius;
  this.x_coord = x || 0;
  this.y_coord = y || 0;
  this.x_speed = x_speed || 0;
  this.y_speed = y_speed || 0;
}

/*Ship Object*/
function Ship(x, y, speed, radius, weapon_power) {
	this.speed = 200 || speed;
	this.super(radius, x, y, this.speed, 0);
	this.right_thruster = false;
	this.left_thruster = false;
	this.radius = radius || 0;
	this.weapon_reload_time = 0.8; // seconds
	this.time_until_reloaded = this.weapon_reload_time;
	this.alive = true;
	this.time_dead = 0;
}
extend(Ship, Mass);

Ship.prototype.draw = function(c) {
	c.save();
	var img = new Image();

	if (this.alive) {
		img.src = "./assets/images/tank.png";
	}
	else
		img.src = "./assets/images/tank_destroyed.png";

	c.drawImage(img, this.x_coord, this.y_coord);
	c.restore();
}

Ship.prototype.projectile = function(elapsed) {
	var p = new Projectile(10, this.x_coord, this.y_coord, this.radius, -1, true);
	this.time_until_reloaded = this.weapon_reload_time;
	return p;
}

Ship.prototype.update = function(elapsed, c) {

	if (this.alive == false) {
		this.time_until_reloaded = 0.8;
		return;
	}

	if(this.time_until_reloaded > 0) {
		this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
	}

	if (this.right_thruster) {

		if (this.x_coord + 24 + this.radius >= c.canvas.width) {
			return;
		}

		this.x_coord = this.x_coord + (this.x_speed * elapsed);
	}
	else if (this.left_thruster) {

		if (this.x_coord - 24 <= 0) {
			return;
		}

		this.x_coord = this.x_coord - (this.x_speed * elapsed);
	}
}

/*Project Object*/
function Projectile(radius, x, y, ship_radius, direction, tb) {
	this.speed = 800;
	this.width = 2;
	this.height = 10;
	this.direction = direction || -1;
	this.tank_bullet = tb || false;
	this.super(this.height / 2, x, y, this.speed, ship_radius);
}
extend(Projectile, Mass);

Projectile.prototype.update = function(elapsed, c) {
	this.y_coord = this.y_coord + (this.speed * elapsed) * this.direction;
}

Projectile.prototype.draw = function(c, guide) {
	c.save();
	c.translate(this.x_coord - 1.2, this.y_coord + 15);
	draw_projectile(c, 13, this.width, this.height);
	c.restore();
}

/*Alien Object*/
function Alien(x, y, type, speed) {
	var radius = 0;

	switch (type)
	{
		case 0:
		radius = 8;
		break;
		case 1:
		radius = 11;
		break;
		case 2:
		radius = 12;
		break;
		case 3:
		radius = 24;
		break;
	}

	this.speed = speed || 20;
	this.can_shoot = false;
	this.type = type || 0;
	this.state = 0;
	this.speed_increase = 5;
	this.time_state = 0;
	this.time_dead = 0;
	this.alien_dir = 1;
	this.retaliate_rate = 50;
	this.time_until_shoot = Math.floor((Math.random() * 12) + 7);
	this.last_in_row = false;

	this.super(radius, x, y, this.speed, 0);
}
extend(Alien, Mass);

Alien.prototype.draw = function(c) {
  c.save();
  var img = new Image();

  img.src = "./assets/images/alien_" + this.type + "_a" + this.state + ".png";

  if (this.state > 1) {
	  img.src = "./assets/images/alien_destroyed.png";
  }

  c.drawImage(img, this.x_coord, this.y_coord);
  c.restore();
}

Alien.prototype.projectile = function(elapsed) {
  var p = new Projectile(10, this.x_coord, this.y_coord + 20, this.radius, 1);
  return p;
}

Alien.prototype.update = function(elapsed, c) {

	this.time_state += elapsed * (this.speed / 10);

	if (this.time_state > 1.1) {
		if (this.state == 0) {
			this.state = 1;
		}
		else if (this.state == 1) {
			this.state = 0;
		}
		this.time_state = 0;
	}

	if (elapsed > 1)
		return;

	this.x_coord = this.x_coord + (this.speed * elapsed) * this.alien_dir;
}

/*Red Spaceship object*/
function SpaceShip(x, y, speed, direction) {
	this.speed = speed || 20;
	this.alive = true;
	this.time_dead = 0;
	this.speed_increase = 1;
	this.ship_dir = direction || 1;
	this.super(24, x, y, this.speed, 0);
}
extend(SpaceShip, Mass);

SpaceShip.prototype.draw = function(c) {
  c.save();
  var img = new Image();
  img.src = "./assets/images/space_ship.png";

  if (!this.alive) {
	img.src = "./assets/images/alien_destroyed.png";
  }

  c.drawImage(img, this.x_coord, this.y_coord);
  c.restore();
}

SpaceShip.prototype.update = function(elapsed, c) {
	if (elapsed > 1)
		return;

	this.x_coord = this.x_coord + (this.speed * elapsed) * this.ship_dir;
}

/*Left Barrier Object*/
function BarrierLeft(x, y) {
	this.hits = 1;
	this.radius = 0;
	this.super(7, x, y, this.speed, 0);
}
extend(BarrierLeft, Mass);

BarrierLeft.prototype.draw = function(c) {
  c.save();
  var img = new Image();

  if (this.hits < 3) {
    img.src = "./assets/images/barrier_l_0.png"; //1, 2 = not damaged
  }
  else if (this.hits == 3 || this.hits == 4) { // 3, 4 = slightly damaged
    img.src = "./assets/images/barrier_l_1.png";
  }
  else if (this.hits == 5 || this.hits == 6) { // 5, 6 = heavily damaged
    img.src = "./assets/images/barrier_l_2.png";
  }
  else if (this.hits > 6) {
    img.src = "";
  }

  c.drawImage(img, this.x_coord, this.y_coord);
  c.restore();
}

/*Middle Barrier Object*/
function BarrierMiddle(x, y) {
	this.hits = 1;
	this.radius = 0;
	this.super(7, x, y, this.speed, 0);
}
extend(BarrierMiddle, Mass);

BarrierMiddle.prototype.draw = function(c) {
  c.save();
  var img = new Image();

  if (this.hits < 3) {
    img.src = "./assets/images/barrier_m_0.png";
  }
  else if (this.hits == 3 || this.hits == 4) {
    img.src = "./assets/images/barrier_m_1.png";
  }
  else if (this.hits == 5 || this.hits == 6) {
    img.src = "./assets/images/barrier_m_2.png";
  }
  else if (this.hits > 6) {
    img.src = "";
  }

  c.drawImage(img, this.x_coord, this.y_coord);
  c.restore();
}

/*Right Barrier Object*/
function BarrierRight(x, y) {
	this.hits = 1;
	this.radius = 0;
	this.super(7, x, y, this.speed, 0);
}
extend(BarrierRight, Mass);

BarrierRight.prototype.draw = function(c) {
  c.save();
  var img = new Image();

  if (this.hits < 3) {
    img.src = "./assets/images/barrier_r_0.png";
  }
  else if (this.hits == 3 || this.hits == 4) {
    img.src = "./assets/images/barrier_r_1.png";
  }
  else if (this.hits == 5 || this.hits == 6) {
    img.src = "./assets/images/barrier_r_2.png";
  }
  else if (this.hits > 6) {
    img.src = "";
  }

  c.drawImage(img, this.x_coord, this.y_coord);
  c.restore();
}
