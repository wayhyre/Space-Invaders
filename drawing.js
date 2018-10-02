function draw_grid(ctx, minor, major, stroke, fill) {
  ctx.save();
  minor = minor || 10;
  major = major || minor * 5;

  ctx.strokeStyle = stroke || "#00FF00";
  ctx.fillStyle = fill || "#009900";

  for(var x = 0; x < ctx.canvas.width; x += minor) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.lineWidth = (x % major == 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(x % major == 0 ) {ctx.fillText(x, x, 10);}
  }

  for(var y = 0; y < ctx.canvas.height; y += minor) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.lineWidth = (y % major == 0) ? 0.5 : 0.25;
    ctx.stroke();
    if(y % major == 0 ) {ctx.fillText(y, 0, y + 10);}
  }
  ctx.restore();
}

function draw_projectile(ctx, radius, width, height) {
  ctx.save();
  ctx.fillStyle = "rgb(100%, 100%, 100%)";
  ctx.beginPath();
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(radius, -radius, width, height);
  ctx.restore();
}

function centre_text(ctx, text, y, pt) {
  ctx.save();
  ctx.font = (pt || 18) + "pt Arial";
  ctx.fillStyle = "#FFFFFF";
  var x = (ctx.canvas.width - ctx.measureText(text).width) / 2;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function NumberLabel(label, x, y, digits, pt) {
  this.label = label;
  this.x = x;
  this.y = y;
  this.digits = digits;
  this.pt = pt || 10;
}

NumberLabel.prototype.draw = function(c, value) {
  c.save();
  c.fillStyle = "#FFFFFF";
  c.font = this.pt + "pt Arial";
  var offset = c.measureText(this.label).width;
  c.fillText(this.label + value.toFixed(this. digits), this.x, this.y + this.pt - 1);
  c.restore();
}

function Label(label, x, y, digits, pt) {
  this.label = label;
  this.x = x;
  this.y = y;
  this.digits = digits;
  this.pt = pt || 10;
}

Label.prototype.draw = function(c) {
  c.save();
  c.fillStyle = "#FFFFFF";
  c.font = this.pt + "pt Arial";
  var offset = c.measureText(this.label).width;
  c.fillText(this.label, this.x, this.y + this.pt - 1);
  c.restore();
}

function Indicator(label, x, y, width, height) {
  this.label = label + ": ";
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Indicator.prototype.draw = function(c, max, level) {
  c.save();
  c.strokeStyle = "#FFFFFF";
  c.fillStyle = "#FFFFFF";
  c.font = this.height + "pt Arial";
  var offset = c.measureText(this.label).width;
  c.fillText(this.label, this.x, this.y + this.height - 1);
  c.beginPath();
  c.rect(offset + this.x, this.y, this.width, this.height);
  c.stroke();
  c.beginPath();
  c.rect(offset + this.x, this.y, this.width * (max / level), this.height);
  c.fill();
  c.restore();
}
